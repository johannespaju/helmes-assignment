using BLL.Contracts;
using DTO;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.ApiControllers;

[ApiController]
[Route("api/[controller]")]
public class PersonsController(IPersonService personService) : ControllerBase
{
    // GET: api/Persons/5
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PersonDto>> GetPerson(Guid id)
    {
        var person = await personService.GetAsync(id);
        return person is null ? NotFound() : person;
    }

    // POST: api/Persons
    [HttpPost]
    public async Task<ActionResult<PersonDto>> PostPerson(PersonDto dto)
    {
        var person = await personService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetPerson), new { id = person.Id }, person);
    }

    // PUT: api/Persons/5
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PersonDto>> PutPerson(Guid id, PersonDto dto)
    {
        var person = await personService.UpdateAsync(id, dto);
        return person is null ? NotFound() : person;
    }
}
