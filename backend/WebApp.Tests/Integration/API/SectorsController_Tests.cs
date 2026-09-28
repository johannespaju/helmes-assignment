using System.Net.Http.Json;
using AwesomeAssertions;
using DTO;
using WebApp.Tests.Helpers;

namespace WebApp.Tests.Integration.API;

public class SectorsController_Tests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task Get_ReturnsNestedTree()
    {
        var tree = await factory.CreateClient().GetFromJsonAsync<List<SectorDto>>("/api/Sectors");

        tree.Should().NotBeNull();
        tree!.Select(s => s.Name).Should().Equal("Manufacturing", "Service", "Other");

        var manufacturing = tree[0];
        manufacturing.Id.Should().Be(TestSectors.Manufacturing);

        var foodAndBeverage = manufacturing.Children.Single(s => s.Id == TestSectors.FoodAndBeverage);
        foodAndBeverage.Children.Should().Contain(s => s.Id == TestSectors.Beverages);
        foodAndBeverage.Children.Should().OnlyContain(s => s.Children.Count == 0);
    }
}
