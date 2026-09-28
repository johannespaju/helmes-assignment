using AwesomeAssertions;
using BLL.Services;
using DAL.Contracts;
using Domain;
using Moq;

namespace WebApp.Tests.Unit.BLL;

public class SectorService_Tests
{
    private readonly Mock<ISectorRepository> _repository = new();
    private readonly SectorService _sut;

    public SectorService_Tests()
    {
        _sut = new SectorService(_repository.Object);
    }

    [Fact]
    public async Task GetAllAsync_BuildsNestedTree()
    {
        var root = new Sector { Name = "Root" };
        var child = new Sector { Name = "Child", ParentId = root.Id };
        var grandchild = new Sector { Name = "Grandchild", ParentId = child.Id };
        var otherRoot = new Sector { Name = "Other root" };
        _repository.Setup(r => r.AllAsync()).ReturnsAsync([grandchild, root, otherRoot, child]);

        var tree = await _sut.GetAllAsync();

        tree.Select(s => s.Name).Should().Equal("Root", "Other root");
        tree[0].Children.Should().ContainSingle().Which.Name.Should().Be("Child");
        tree[0].Children[0].Children.Should().ContainSingle().Which.Id.Should().Be(grandchild.Id);
        tree[0].Children[0].Children[0].Children.Should().BeEmpty();
        tree[1].Children.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_KeepsRepositoryOrderAmongSiblings()
    {
        var root = new Sector { Name = "Root" };
        var b = new Sector { Name = "B", ParentId = root.Id };
        var a = new Sector { Name = "A", ParentId = root.Id };
        _repository.Setup(r => r.AllAsync()).ReturnsAsync([root, b, a]);

        var tree = await _sut.GetAllAsync();

        tree[0].Children.Select(s => s.Name).Should().Equal("B", "A");
    }

    [Fact]
    public async Task GetAllAsync_NoSectors_ReturnsEmpty()
    {
        _repository.Setup(r => r.AllAsync()).ReturnsAsync([]);

        var tree = await _sut.GetAllAsync();

        tree.Should().BeEmpty();
    }

    [Fact]
    public async Task AreSelectableAsync_AllSelectable_ReturnsTrue()
    {
        _repository.Setup(r => r.CountSelectableAsync(It.IsAny<IReadOnlyCollection<Guid>>())).ReturnsAsync(2);

        var ok = await _sut.AreSelectableAsync([Guid.NewGuid(), Guid.NewGuid()]);

        ok.Should().BeTrue();
    }

    [Fact]
    public async Task AreSelectableAsync_SomeNotSelectable_ReturnsFalse()
    {
        _repository.Setup(r => r.CountSelectableAsync(It.IsAny<IReadOnlyCollection<Guid>>())).ReturnsAsync(1);

        var ok = await _sut.AreSelectableAsync([Guid.NewGuid(), Guid.NewGuid()]);

        ok.Should().BeFalse();
    }

    [Fact]
    public async Task AreSelectableAsync_Empty_ReturnsFalse()
    {
        var ok = await _sut.AreSelectableAsync([]);

        ok.Should().BeFalse();
        _repository.Verify(r => r.CountSelectableAsync(It.IsAny<IReadOnlyCollection<Guid>>()), Times.Never);
    }

    [Fact]
    public async Task AreSelectableAsync_Duplicates_AreCountedOnce()
    {
        var id = Guid.NewGuid();
        _repository.Setup(r => r.CountSelectableAsync(It.IsAny<IReadOnlyCollection<Guid>>())).ReturnsAsync(1);

        var ok = await _sut.AreSelectableAsync([id, id]);

        ok.Should().BeTrue();
        _repository.Verify(r => r.CountSelectableAsync(It.Is<IReadOnlyCollection<Guid>>(ids => ids.Count == 1)), Times.Once);
    }

    [Fact]
    public async Task GetSelfAndDescendantIdsAsync_Parent_ReturnsSelfAndAllDescendants()
    {
        var root = new Sector { Name = "Root" };
        var child = new Sector { Name = "Child", ParentId = root.Id };
        var grandchild = new Sector { Name = "Grandchild", ParentId = child.Id };
        var otherRoot = new Sector { Name = "Other root" };
        var otherChild = new Sector { Name = "Other child", ParentId = otherRoot.Id };
        _repository.Setup(r => r.AllAsync()).ReturnsAsync([root, child, grandchild, otherRoot, otherChild]);

        var ids = await _sut.GetSelfAndDescendantIdsAsync(root.Id);

        ids.Should().BeEquivalentTo([root.Id, child.Id, grandchild.Id]);
    }

    [Fact]
    public async Task GetSelfAndDescendantIdsAsync_Leaf_ReturnsOnlyItself()
    {
        var root = new Sector { Name = "Root" };
        var leaf = new Sector { Name = "Leaf", ParentId = root.Id };
        _repository.Setup(r => r.AllAsync()).ReturnsAsync([root, leaf]);

        var ids = await _sut.GetSelfAndDescendantIdsAsync(leaf.Id);

        ids.Should().Equal(leaf.Id);
    }

    [Fact]
    public async Task GetSelfAndDescendantIdsAsync_Unknown_ReturnsEmpty()
    {
        _repository.Setup(r => r.AllAsync()).ReturnsAsync([new Sector { Name = "Root" }]);

        var ids = await _sut.GetSelfAndDescendantIdsAsync(Guid.NewGuid());

        ids.Should().BeEmpty();
    }
}
