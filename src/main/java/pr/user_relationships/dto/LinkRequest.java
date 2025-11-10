package pr.user_relationships.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LinkRequest {
    @NotBlank(message = "Friend ID is required")
    private String friendId;
}
