using System.ComponentModel.DataAnnotations;

namespace DTO;

public record SubmissionDto(
    Guid Id,
    [Required, MaxLength(128)] string Name,
    [Required, MinLength(1)] IReadOnlyList<Guid> SectorIds,
    bool AgreeToTerms);
