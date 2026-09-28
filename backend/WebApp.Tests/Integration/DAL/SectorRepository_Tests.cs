using AwesomeAssertions;
using DAL.Repositories;
using DAL.Seeding;
using WebApp.Tests.Helpers;

namespace WebApp.Tests.Integration.DAL;

public class SectorRepository_Tests : RepositoryTestBase
{
    [Fact]
    public async Task AllAsync_ReturnsAllSeededSectorsInSortOrder()
    {
        await using var ctx = CreateContext();
        var all = await new SectorRepository(ctx).AllAsync();

        all.Select(s => s.Id).Should().BeEquivalentTo(SectorSeed.Sectors.Select(s => s.Id));
        all.Select(s => s.SortOrder).Should().BeInAscendingOrder();
    }

    [Fact]
    public async Task CountSelectableAsync_CountsSectorsWithoutSubsectors()
    {
        await using var ctx = CreateContext();
        var count = await new SectorRepository(ctx).CountSelectableAsync(
            [TestSectors.ConstructionMaterials, TestSectors.CreativeIndustries, TestSectors.Beverages]);

        count.Should().Be(3);
    }

    [Fact]
    public async Task CountSelectableAsync_IgnoresSectorsWithSubsectors()
    {
        await using var ctx = CreateContext();
        var count = await new SectorRepository(ctx).CountSelectableAsync(
            [TestSectors.ConstructionMaterials, TestSectors.Manufacturing, TestSectors.FoodAndBeverage]);

        count.Should().Be(1);
    }

    [Fact]
    public async Task CountSelectableAsync_IgnoresUnknownIds()
    {
        await using var ctx = CreateContext();
        var count = await new SectorRepository(ctx).CountSelectableAsync(
            [TestSectors.ConstructionMaterials, Guid.NewGuid()]);

        count.Should().Be(1);
    }
}
