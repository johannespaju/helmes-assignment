using BLL.Contracts;
using DTO;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.ApiControllers;

[ApiController]
[Route("api/[controller]")]
public class PersonsController(IPersonService personService, ISectorService sectorService) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PersonDto>> GetPerson(Guid id)
    {
        var person = await personService.GetAsync(id);
        return person is null ? NotFound() : person;
    }

    [HttpPost]
    public async Task<ActionResult<PersonDto>> PostPerson(PersonDto dto)
    {
        if (!await IsValidAsync(dto)) return ValidationProblem();

        var created = await personService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetPerson), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PersonDto>> PutPerson(Guid id, PersonDto dto)
    {
        if (id != dto.Id) return BadRequest("Route id and body id do not match.");
        if (!await IsValidAsync(dto)) return ValidationProblem();

        var updated = await personService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : updated;
    }

    private async Task<bool> IsValidAsync(PersonDto dto)
    {
        if (!dto.AgreeToTerms)
            ModelState.AddModelError(nameof(PersonDto.AgreeToTerms), "You must agree to the terms.");
        if (!await sectorService.AreSelectableAsync(dto.SectorIds))
            ModelState.AddModelError(nameof(PersonDto.SectorIds), "Select at least one sector. Sectors that have subsectors cannot be selected.");

        return ModelState.IsValid;
    }
}
