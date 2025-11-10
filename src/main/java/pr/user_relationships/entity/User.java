package pr.user_relationships.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Username is required")
    @Column(unique = true, nullable = false)
    private String username;

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 150, message = "Age must be at most 100")
    private Integer age;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_hobbies", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "hobby")
    @NotEmpty(message = "At least one hobby is required")
    private List<String> hobbies = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_friends",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    @Builder.Default
    private Set<User> friends = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private Double popularityScore;

    // Calculate popularity score
    public Double getPopularityScore() {
        if (popularityScore == null) {
            calculatePopularityScore();
        }
        return popularityScore;
    }

    public void calculatePopularityScore() {
        int uniqueFriends = friends.size();
        double sharedHobbiesScore = 0.0;

        for (User friend : friends) {
            long sharedHobbies = hobbies.stream()
                    .filter(hobby -> friend.getHobbies().contains(hobby))
                    .count();
            sharedHobbiesScore += sharedHobbies;
        }

        this.popularityScore = uniqueFriends + (sharedHobbiesScore * 0.5);
    }

    // Helper methods for bidirectional friendship
    public void addFriend(User friend) {
        this.friends.add(friend);
        friend.friends.add(this);
    }

    public void removeFriend(User friend) {
        this.friends.remove(friend);
        friend.friends.remove(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return id != null && id.equals(user.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "User{id='" + id + "', username='" + username + "'}";
    }
}
