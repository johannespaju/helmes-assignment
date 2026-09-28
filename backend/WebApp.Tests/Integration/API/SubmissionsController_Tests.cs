using System.Net;
using System.Net.Http.Json;
using System.Text;
using AwesomeAssertions;
using DAL;
using DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Tests.Helpers;

namespace WebApp.Tests.Integration.API;

public class SubmissionsController_Tests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private static SubmissionDto ValidDto(Guid? id = null) =>
        new(id ?? Guid.Empty, "Jane Doe", [TestSectors.ConstructionMaterials], true);

    private async Task<SubmissionDto> CreateSubmissionAsync()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto());
        res.EnsureSuccessStatusCode();
        return (await res.Content.ReadFromJsonAsync<SubmissionDto>())!;
    }

    private static async Task<IDictionary<string, string[]>> ErrorsAsync(HttpResponseMessage res) =>
        (await res.Content.ReadFromJsonAsync<ValidationProblemDetails>())!.Errors;

    [Fact]
    public async Task Get_Unknown_Returns404()
    {
        var res = await _client.GetAsync($"/api/Submissions/{Guid.NewGuid()}");

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetBySector_Parent_ReturnsPeopleWithDescendantSectors()
    {
        var name = $"Beverage person {Guid.NewGuid()}";
        var res = await _client.PostAsJsonAsync("/api/Submissions",
            ValidDto() with { Name = name, SectorIds = [TestSectors.Beverages] });
        res.EnsureSuccessStatusCode();

        var underManufacturing = await _client.GetFromJsonAsync<List<SubmissionDto>>(
            $"/api/Submissions?sectorId={TestSectors.Manufacturing}");
        var underCreativeIndustries = await _client.GetFromJsonAsync<List<SubmissionDto>>(
            $"/api/Submissions?sectorId={TestSectors.CreativeIndustries}");

        underManufacturing!.Should().ContainSingle(s => s.Name == name)
            .Which.SectorIds.Should().Equal(TestSectors.Beverages);
        underCreativeIndustries!.Should().NotContain(s => s.Name == name);
    }

    [Fact]
    public async Task GetBySector_Unknown_ReturnsEmpty()
    {
        var submissions = await _client.GetFromJsonAsync<List<SubmissionDto>>(
            $"/api/Submissions?sectorId={Guid.NewGuid()}");

        submissions.Should().BeEmpty();
    }

    [Fact]
    public async Task Post_Valid_Returns201AndCanBeFetched()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto());

        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await res.Content.ReadFromJsonAsync<SubmissionDto>();
        created!.Id.Should().NotBe(Guid.Empty);
        created.Name.Should().Be("Jane Doe");
        created.SectorIds.Should().Equal(TestSectors.ConstructionMaterials);
        created.AgreeToTerms.Should().BeTrue();
        res.Headers.Location!.ToString().Should().EndWithEquivalentOf($"/api/Submissions/{created.Id}");

        var fetched = await _client.GetFromJsonAsync<SubmissionDto>($"/api/Submissions/{created.Id}");
        fetched!.Id.Should().Be(created.Id);
        fetched.Name.Should().Be(created.Name);
        fetched.SectorIds.Should().Equal(created.SectorIds);
        fetched.AgreeToTerms.Should().Be(created.AgreeToTerms);
    }

    [Fact]
    public async Task Post_TrimsName()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto() with { Name = "  Jane  " });

        var created = await res.Content.ReadFromJsonAsync<SubmissionDto>();
        created!.Name.Should().Be("Jane");
    }

    [Fact]
    public async Task Post_DuplicateSectors_StoredOnce()
    {
        var dto = ValidDto() with { SectorIds = [TestSectors.ConstructionMaterials, TestSectors.ConstructionMaterials] };

        var res = await _client.PostAsJsonAsync("/api/Submissions", dto);

        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await res.Content.ReadFromJsonAsync<SubmissionDto>();
        var fetched = await _client.GetFromJsonAsync<SubmissionDto>($"/api/Submissions/{created!.Id}");
        fetched!.SectorIds.Should().Equal(TestSectors.ConstructionMaterials);
    }

    [Theory]
    [MemberData(nameof(SectorsWithSubsectors))]
    public async Task Post_SectorWithSubsectors_Returns400(Guid sectorId)
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions",
            ValidDto() with { SectorIds = [TestSectors.ConstructionMaterials, sectorId] });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.SectorIds));
    }

    public static TheoryData<Guid> SectorsWithSubsectors => new() { TestSectors.Manufacturing, TestSectors.FoodAndBeverage };

    [Fact]
    public async Task Post_UnknownSector_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto() with { SectorIds = [Guid.NewGuid()] });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.SectorIds));
    }

    [Fact]
    public async Task Post_EmptySectors_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto() with { SectorIds = [] });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.SectorIds));
    }

    [Fact]
    public async Task Post_NotAgreedToTerms_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto() with { AgreeToTerms = false });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.AgreeToTerms));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Post_MissingName_Returns400(string? name)
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto() with { Name = name! });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.Name));
    }

    [Fact]
    public async Task Post_NameTooLong_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto() with { Name = new string('a', 129) });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.Name));
    }

    [Fact]
    public async Task Post_AllFieldsInvalid_ReturnsAllErrorsAtOnce()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions",
            new SubmissionDto(Guid.Empty, "", [TestSectors.Manufacturing], false));

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Keys.Should().BeEquivalentTo(
            nameof(SubmissionDto.Name), nameof(SubmissionDto.SectorIds), nameof(SubmissionDto.AgreeToTerms));
    }

    [Fact]
    public async Task Post_NullSectors_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/Submissions", ValidDto() with { SectorIds = null! });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.SectorIds));
    }

    [Theory]
    [InlineData("")]
    [InlineData("null")]
    [InlineData("{ not json")]
    public async Task Post_MissingOrMalformedBody_Returns400(string body)
    {
        var res = await _client.PostAsync("/api/Submissions", new StringContent(body, Encoding.UTF8, "application/json"));

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Put_Valid_Returns200AndUpdates()
    {
        var created = await CreateSubmissionAsync();
        var dto = new SubmissionDto(created.Id, "John Smith", [TestSectors.CreativeIndustries, TestSectors.Beverages], true);

        var res = await _client.PutAsJsonAsync($"/api/Submissions/{created.Id}", dto);

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await res.Content.ReadFromJsonAsync<SubmissionDto>();
        updated!.Name.Should().Be("John Smith");
        updated.SectorIds.Should().BeEquivalentTo([TestSectors.CreativeIndustries, TestSectors.Beverages]);

        var fetched = await _client.GetFromJsonAsync<SubmissionDto>($"/api/Submissions/{created.Id}");
        fetched!.Name.Should().Be("John Smith");
        fetched.SectorIds.Should().BeEquivalentTo([TestSectors.CreativeIndustries, TestSectors.Beverages]);
    }

    [Fact]
    public async Task Put_KeepsCreatedAt_BumpsUpdatedAt()
    {
        var created = await CreateSubmissionAsync();
        var (createdAt, updatedAt) = await TimestampsAsync(created.Id);

        await _client.PutAsJsonAsync($"/api/Submissions/{created.Id}", ValidDto(created.Id) with { Name = "John" });

        var (createdAtAfter, updatedAtAfter) = await TimestampsAsync(created.Id);
        createdAtAfter.Should().Be(createdAt);
        updatedAtAfter.Should().BeAfter(updatedAt);
    }

    private async Task<(DateTime CreatedAt, DateTime UpdatedAt)> TimestampsAsync(Guid id)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var submission = await db.Submissions.SingleAsync(s => s.Id == id);
        return (submission.CreatedAt, submission.UpdatedAt);
    }

    [Fact]
    public async Task Put_IdMismatch_Returns400()
    {
        var created = await CreateSubmissionAsync();

        var res = await _client.PutAsJsonAsync($"/api/Submissions/{created.Id}", ValidDto(Guid.NewGuid()));

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey("id");
        var fetched = await _client.GetFromJsonAsync<SubmissionDto>($"/api/Submissions/{created.Id}");
        fetched!.Name.Should().Be(created.Name);
    }

    [Fact]
    public async Task Put_NotAgreedToTerms_Returns400()
    {
        var created = await CreateSubmissionAsync();

        var res = await _client.PutAsJsonAsync($"/api/Submissions/{created.Id}",
            ValidDto(created.Id) with { AgreeToTerms = false });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.AgreeToTerms));
    }

    [Fact]
    public async Task Put_SectorWithSubsectors_Returns400()
    {
        var created = await CreateSubmissionAsync();

        var res = await _client.PutAsJsonAsync($"/api/Submissions/{created.Id}",
            ValidDto(created.Id) with { SectorIds = [TestSectors.Manufacturing] });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.SectorIds));
    }

    [Fact]
    public async Task Put_EmptySectors_Returns400()
    {
        var created = await CreateSubmissionAsync();

        var res = await _client.PutAsJsonAsync($"/api/Submissions/{created.Id}",
            ValidDto(created.Id) with { SectorIds = [] });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await ErrorsAsync(res)).Should().ContainKey(nameof(SubmissionDto.SectorIds));
        var fetched = await _client.GetFromJsonAsync<SubmissionDto>($"/api/Submissions/{created.Id}");
        fetched!.SectorIds.Should().Equal(created.SectorIds);
    }

    [Fact]
    public async Task Put_UnknownSubmission_ValidBody_Returns404()
    {
        var id = Guid.NewGuid();

        var res = await _client.PutAsJsonAsync($"/api/Submissions/{id}", ValidDto(id));

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Put_UnknownSubmission_InvalidBody_Returns400()
    {
        var id = Guid.NewGuid();

        var res = await _client.PutAsJsonAsync($"/api/Submissions/{id}", ValidDto(id) with { AgreeToTerms = false });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
