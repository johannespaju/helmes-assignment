using BLL.Contracts;
using DTO;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.ApiControllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionsController(ISubmissionService submissionService, ISectorService sectorService) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubmissionDto>> GetSubmission(Guid id)
    {
        var submission = await submissionService.GetAsync(id);
        return submission is null ? NotFound() : submission;
    }

    [HttpPost]
    public async Task<ActionResult<SubmissionDto>> PostSubmission(SubmissionDto dto)
    {
        if (!await IsValidAsync(dto)) return ValidationProblem();

        var created = await submissionService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetSubmission), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SubmissionDto>> PutSubmission(Guid id, SubmissionDto dto)
    {
        if (id != dto.Id) return BadRequest("Route id and body id do not match.");
        if (!await IsValidAsync(dto)) return ValidationProblem();

        var updated = await submissionService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : updated;
    }

    private async Task<bool> IsValidAsync(SubmissionDto dto)
    {
        if (!dto.AgreeToTerms)
            ModelState.AddModelError(nameof(SubmissionDto.AgreeToTerms), "You must agree to the terms.");
        if (!await sectorService.AreSelectableAsync(dto.SectorIds))
            ModelState.AddModelError(nameof(SubmissionDto.SectorIds), "Select at least one sector. Sectors that have subsectors cannot be selected.");

        return ModelState.IsValid;
    }
}
