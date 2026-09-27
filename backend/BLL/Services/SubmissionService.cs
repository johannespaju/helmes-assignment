using BLL.Contracts;
using DAL.Contracts;
using Domain;
using DTO;

namespace BLL.Services;

public class SubmissionService(ISubmissionRepository submissionRepository) : ISubmissionService
{
    public async Task<SubmissionDto?> GetAsync(Guid id)
    {
        var submission = await submissionRepository.FindAsync(id);
        return submission is null ? null : ToDto(submission);
    }

    public async Task<SubmissionDto> CreateAsync(SubmissionDto dto)
    {
        var now = DateTime.UtcNow;
        var submission = new Submission
        {
            Name = dto.Name.Trim(),
            AgreeToTerms = dto.AgreeToTerms,
            CreatedAt = now,
            UpdatedAt = now,
            SubmissionSectors = dto.SectorIds.Distinct().Select(sectorId => new SubmissionSector { SectorId = sectorId }).ToList()
        };

        submissionRepository.Add(submission);
        await submissionRepository.SaveChangesAsync();

        return ToDto(submission);
    }

    public async Task<SubmissionDto?> UpdateAsync(Guid id, SubmissionDto dto)
    {
        var submission = await submissionRepository.FindAsync(id);
        if (submission is null) return null;

        submission.Name = dto.Name.Trim();
        submission.AgreeToTerms = dto.AgreeToTerms;
        submission.UpdatedAt = DateTime.UtcNow;

        var sectorIds = dto.SectorIds.ToHashSet();
        foreach (var submissionSector in submission.SubmissionSectors.ToList())
        {
            var wasInNewSelection = sectorIds.Remove(submissionSector.SectorId);
            
            if (!wasInNewSelection)
            {
                submission.SubmissionSectors.Remove(submissionSector);
            }
        }

        foreach (var sectorId in sectorIds)
        {
            submission.SubmissionSectors.Add(new SubmissionSector { SectorId = sectorId });
        }

        await submissionRepository.SaveChangesAsync();

        return ToDto(submission);
    }

    private static SubmissionDto ToDto(Submission submission) => new(
        submission.Id,
        submission.Name,
        submission.SubmissionSectors.Select(ss => ss.SectorId).ToList(),
        submission.AgreeToTerms);
}
