package pr.user_relationships.service;

import org.apache.coyote.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pr.user_relationships.dto.CreateUserRequest;
import pr.user_relationships.dto.GraphResponse;
import pr.user_relationships.dto.Relationship;
import pr.user_relationships.dto.UserDTO;
import pr.user_relationships.entity.User;
import pr.user_relationships.exception.ConflictException;
import pr.user_relationships.repository.UserRepository;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user1;
    private User user2;
    private User user3;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id("uuid-1")
                .username("alice")
                .age(25)
                .hobbies(Arrays.asList("reading", "gaming", "cooking"))
                .friends(new HashSet<>())
                .build();

        user2 = User.builder()
                .id("uuid-2")
                .username("bob")
                .age(30)
                .hobbies(Arrays.asList("gaming", "hiking", "cooking"))
                .friends(new HashSet<>())
                .build();

        user3 = User.builder()
                .id("uuid-3")
                .username("charlie")
                .age(28)
                .hobbies(Arrays.asList("reading", "music"))
                .friends(new HashSet<>())
                .build();
    }

    @Test
    void testPopularityScoreCalculation() {
        // Setup: user1 friends with user2 and user3
        user1.addFriend(user2);
        user1.addFriend(user3);

        when(userRepository.findById("uuid-1")).thenReturn(Optional.of(user1));

        // Execute
        UserDTO result = userService.getUserById("uuid-1");

        // Verify
        // user1 has 2 friends
        // Shared hobbies: with user2 (gaming, cooking) = 2, with user3 (reading) = 1
        // Total shared = 3
        // Score = 2 + (3 * 0.5) = 3.5
        assertEquals(3.5, result.getPopularityScore(), 0.01);
    }

    @Test
    void testDeleteUserWithFriendsThrowsConflict() {
        // Setup: user1 has friends
        user1.addFriend(user2);
        when(userRepository.findById("uuid-1")).thenReturn(Optional.of(user1));

        // Execute & Verify
        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> userService.deleteUser("uuid-1")
        );

        assertTrue(exception.getMessage().contains("existing friendships"));
        verify(userRepository, never()).delete(any());
    }

    @Test
    void testCircularFriendshipPrevention() {
        // Setup: user1 and user2 already friends
        user1.addFriend(user2);
        when(userRepository.findById("uuid-1")).thenReturn(Optional.of(user1));
        when(userRepository.findById("uuid-2")).thenReturn(Optional.of(user2));

        // Execute & Verify: trying to link again should throw conflict
        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> userService.linkUsers("uuid-1", "uuid-2")
        );

        assertTrue(exception.getMessage().contains("already friends"));
    }

    @Test
    void testMutualFriendshipBidirectional() throws BadRequestException {
        // Setup
        when(userRepository.findById("uuid-1")).thenReturn(Optional.of(user1));
        when(userRepository.findById("uuid-2")).thenReturn(Optional.of(user2));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Execute: link user1 -> user2
        userService.linkUsers("uuid-1", "uuid-2");

        // Verify: both users should have each other as friends
        assertTrue(user1.getFriends().contains(user2));
        assertTrue(user2.getFriends().contains(user1));
        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    void testUnlinkRemovesBothDirections() throws BadRequestException {
        // Setup: users are friends
        user1.addFriend(user2);
        when(userRepository.findById("uuid-1")).thenReturn(Optional.of(user1));
        when(userRepository.findById("uuid-2")).thenReturn(Optional.of(user2));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Execute
        userService.unlinkUsers("uuid-1", "uuid-2");

        // Verify: both users should no longer be friends
        assertFalse(user1.getFriends().contains(user2));
        assertFalse(user2.getFriends().contains(user1));
    }

    @Test
    void testCreateUserWithDuplicateUsernameThrowsConflict() {
        // Setup
        CreateUserRequest request = new CreateUserRequest("alice", 25, Arrays.asList("reading"));
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        // Execute & Verify
        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> userService.createUser(request)
        );

        assertTrue(exception.getMessage().contains("already exists"));
    }

    @Test
    void testGraphDataNoDuplicateRelationships() {
        // Setup: bidirectional friendship
        user1.addFriend(user2);
        user2.addFriend(user3);

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2, user3));

        // Execute
        GraphResponse graph = userService.getGraphData();

        // Verify: should have 2 unique relationships (not 4)
        assertEquals(2, graph.getRelationships().size());

        // Verify no duplicate relationships (e.g., both 1->2 and 2->1)
        Set<String> relationshipPairs = new HashSet<>();
        for (Relationship rel : graph.getRelationships()) {
            String pair = rel.getUserId1() + "-" + rel.getUserId2();
            relationshipPairs.add(pair);
        }
        assertEquals(2, relationshipPairs.size());
    }

    @Test
    void testSelfFriendshipThrowsBadRequest() {
        // Setup
        when(userRepository.findById("uuid-1")).thenReturn(Optional.of(user1));

        // Execute & Verify
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> userService.linkUsers("uuid-1", "uuid-1")
        );

        assertTrue(exception.getMessage().contains("cannot be friends with themselves"));
    }
}
