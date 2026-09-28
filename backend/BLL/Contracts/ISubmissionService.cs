using DTO;

namespace BLL.Contracts;

public interface ISubmissionService
{
    Task<SubmissionDto?> GetAsync(Guid id);

    Task<IReadOnlyList<SubmissionDto>> GetBySectorsAsync(IReadOnlyCollection<Guid> sectorIds);

    Task<SubmissionDto> CreateAsync(SubmissionDto dto);

    Task<SubmissionDto?> UpdateAsync(Guid id, SubmissionDto dto);
}
