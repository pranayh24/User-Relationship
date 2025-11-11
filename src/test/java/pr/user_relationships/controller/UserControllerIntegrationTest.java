package pr.user_relationships.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import pr.user_relationships.dto.CreateUserRequest;
import pr.user_relationships.dto.LinkRequest;
import pr.user_relationships.dto.UpdateUserRequest;
import pr.user_relationships.repository.UserRepository;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testCompleteUserLifecycle() throws Exception {
        // 1. Create user
        CreateUserRequest createRequest = new CreateUserRequest(
                "alice",
                25,
                Arrays.asList("reading", "gaming")
        );

        MvcResult createResult = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.age").value(25))
                .andExpect(jsonPath("$.hobbies", hasSize(2)))
                .andReturn();

        String userId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        // 2. Get user
        mockMvc.perform(get("/api/users/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice"));

        // 3. Update user
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setAge(26);

        mockMvc.perform(put("/api/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(26));

        // 4. Delete user (should succeed as no friends)
        mockMvc.perform(delete("/api/users/" + userId))
                .andExpect(status().isNoContent());

        // 5. Verify deletion
        mockMvc.perform(get("/api/users/" + userId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testFriendshipWorkflow() throws Exception {
        // Create two users
        CreateUserRequest user1Request = new CreateUserRequest(
                "alice",
                25,
                Arrays.asList("reading", "gaming")
        );

        CreateUserRequest user2Request = new CreateUserRequest(
                "bob",
                30,
                Arrays.asList("gaming", "hiking")
        );

        MvcResult user1Result = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user1Request)))
                .andExpect(status().isCreated())
                .andReturn();

        MvcResult user2Result = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user2Request)))
                .andExpect(status().isCreated())
                .andReturn();

        String user1Id = objectMapper.readTree(user1Result.getResponse().getContentAsString())
                .get("id").asText();
        String user2Id = objectMapper.readTree(user2Result.getResponse().getContentAsString())
                .get("id").asText();

        // Link users
        LinkRequest linkRequest = new LinkRequest(user2Id);

        mockMvc.perform(post("/api/users/" + user1Id + "/link")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(linkRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.friends", hasSize(1)));

        // Verify both users are friends
        mockMvc.perform(get("/api/users/" + user2Id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.friends", hasSize(1)))
                .andExpect(jsonPath("$.friends[0]").value(user1Id));

        // Try to delete user1 (should fail due to friendship)
        mockMvc.perform(delete("/api/users/" + user1Id))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("existing friendships")));

        // Unlink users
        mockMvc.perform(delete("/api/users/" + user1Id + "/unlink")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(linkRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.friends", hasSize(0)));

        // Now deletion should succeed
        mockMvc.perform(delete("/api/users/" + user1Id))
                .andExpect(status().isNoContent());
    }

    @Test
    void testValidationErrors() throws Exception {
        // Test missing username
        CreateUserRequest invalidRequest = new CreateUserRequest(
                "",
                25,
                Arrays.asList("reading")
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.username").exists());

        // Test invalid age
        CreateUserRequest invalidAgeRequest = new CreateUserRequest(
                "test",
                200,
                Arrays.asList("reading")
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidAgeRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.age").exists());

        // Test empty hobbies
        CreateUserRequest emptyHobbiesRequest = new CreateUserRequest(
                "test",
                25,
                Arrays.asList()
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyHobbiesRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.hobbies").exists());
    }
}
