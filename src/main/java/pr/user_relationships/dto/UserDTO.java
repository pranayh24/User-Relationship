package pr.user_relationships.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String id;

    @NotBlank(message = "Username is required")
    private String username;

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 150, message = "Age must be at most 100")
    private Integer age;

    @NotEmpty(message = "At least one hobby is required")
    private List<String> hobbies;

    private List<String> friends;
    private LocalDateTime createdAt;
    private Double popularityScore;
}
