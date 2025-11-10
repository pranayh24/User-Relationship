package pr.user_relationships.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GraphResponse {
    private List<UserDTO> users;
    private List<Relationship> relationships;
}
