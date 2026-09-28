using AwesomeAssertions;
using DAL.Repositories;
using Domain;
using Microsoft.EntityFrameworkCore;
using WebApp.Tests.Helpers;

namespace WebApp.Tests.Integration.DAL;

public class SubmissionRepository_Tests : RepositoryTestBase
{
    [Fact]
    public async Task FindAsync_Found_IncludesSubmissionSectors()
    {
        var id = await AddSubmissionDirectlyAsync("Jane", TestSectors.ConstructionMaterials, TestSectors.Beverages);

        await using var ctx = CreateContext();
        var submission = await new SubmissionRepository(ctx).FindAsync(id);

        submission.Should().NotBeNull();
        submission!.Name.Should().Be("Jane");
        submission.SubmissionSectors.Select(ss => ss.SectorId)
            .Should().BeEquivalentTo([TestSectors.ConstructionMaterials, TestSectors.Beverages]);
    }

    [Fact]
    public async Task FindAsync_NotFound_ReturnsNull()
    {
        await using var ctx = CreateContext();
        var submission = await new SubmissionRepository(ctx).FindAsync(Guid.NewGuid());

        submission.Should().BeNull();
    }

    [Fact]
    public async Task AllWithAnySectorAsync_ReturnsMatchingSubmissionsSortedByNameWithSectors()
    {
        await AddSubmissionDirectlyAsync("Mary", TestSectors.Beverages);
        await AddSubmissionDirectlyAsync("Adam", TestSectors.CreativeIndustries, TestSectors.ConstructionMaterials);
        await AddSubmissionDirectlyAsync("Zoe", TestSectors.CreativeIndustries);

        await using var ctx = CreateContext();
        var submissions = await new SubmissionRepository(ctx)
            .AllWithAnySectorAsync([TestSectors.ConstructionMaterials, TestSectors.Beverages]);

        submissions.Select(s => s.Name).Should().Equal("Adam", "Mary");
        submissions[0].SubmissionSectors.Select(ss => ss.SectorId)
            .Should().BeEquivalentTo([TestSectors.CreativeIndustries, TestSectors.ConstructionMaterials]);
    }

    [Fact]
    public async Task Add_AndSave_PersistsSubmissionWithSectors()
    {
        var submission = new Submission
        {
            Name = "Jane",
            AgreeToTerms = true,
            SubmissionSectors = [new SubmissionSector { SectorId = TestSectors.CreativeIndustries }]
        };

        await using (var ctx = CreateContext())
        {
            var repo = new SubmissionRepository(ctx);
            repo.Add(submission);
            await repo.SaveChangesAsync();
        }

        await using var verify = CreateContext();
        var stored = await verify.Submissions.Include(s => s.SubmissionSectors).SingleAsync(s => s.Id == submission.Id);
        stored.Name.Should().Be("Jane");
        stored.SubmissionSectors.Should().ContainSingle(ss => ss.SectorId == TestSectors.CreativeIndustries);
    }

    [Fact]
    public async Task SaveChangesAsync_UnknownSectorId_Throws()
    {
        await using var ctx = CreateContext();
        var repo = new SubmissionRepository(ctx);
        repo.Add(new Submission
        {
            Name = "Jane",
            AgreeToTerms = true,
            SubmissionSectors = [new SubmissionSector { SectorId = Guid.NewGuid() }]
        });

        var act = () => repo.SaveChangesAsync();

        await act.Should().ThrowAsync<DbUpdateException>();
    }
}
