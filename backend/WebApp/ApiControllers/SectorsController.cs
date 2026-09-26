using BLL.Contracts;
using DTO;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.ApiControllers;

[ApiController]
[Route("api/[controller]")]
public class SectorsController(ISectorService sectorService) : ControllerBase
{
    // GET: api/Sectors
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SectorDto>>> GetSectors()
    {
        return Ok(await sectorService.GetAllAsync());
    }
}
