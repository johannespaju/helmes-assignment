using AwesomeAssertions;
using BLL.Services;
using DAL.Contracts;
using Domain;
using DTO;
using Moq;

namespace WebApp.Tests.Unit.BLL;

public class SubmissionService_Tests
{
    private readonly Mock<ISubmissionRepository> _repository = new();
    private readonly SubmissionService _sut;

    public SubmissionService_Tests()
    {
        _sut = new SubmissionService(_repository.Object);
    }

    private static Submission SubmissionWithSectors(params Guid[] sectorIds)
    {
        var submission = new Submission
        {
            Name = "Jane",
            AgreeToTerms = true,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        submission.SubmissionSectors = sectorIds
            .Select(id => new SubmissionSector { SubmissionId = submission.Id, SectorId = id })
            .ToList();
        return submission;
    }

    [Fact]
    public async Task GetAsync_NotFound_ReturnsNull()
    {
        _repository.Setup(r => r.FindAsync(It.IsAny<Guid>())).ReturnsAsync((Submission?)null);

        var result = await _sut.GetAsync(Guid.NewGuid());

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAsync_Found_MapsToDto()
    {
        var sectorId = Guid.NewGuid();
        var submission = SubmissionWithSectors(sectorId);
        _repository.Setup(r => r.FindAsync(submission.Id)).ReturnsAsync(submission);

        var result = await _sut.GetAsync(submission.Id);

        result!.Id.Should().Be(submission.Id);
        result.Name.Should().Be("Jane");
        result.AgreeToTerms.Should().BeTrue();
        result.SectorIds.Should().Equal(sectorId);
    }

    [Fact]
    public async Task CreateAsync_AddsAndSaves()
    {
        var sectorId = Guid.NewGuid();
        Submission? added = null;
        _repository.Setup(r => r.Add(It.IsAny<Submission>())).Callback<Submission>(s => added = s);

        var result = await _sut.CreateAsync(new SubmissionDto(Guid.Empty, "Jane", [sectorId], true));

        _repository.Verify(r => r.Add(It.IsAny<Submission>()), Times.Once);
        _repository.Verify(r => r.SaveChangesAsync(), Times.Once);
        added.Should().NotBeNull();
        added!.AgreeToTerms.Should().BeTrue();
        added.SubmissionSectors.Should().ContainSingle(ss => ss.SectorId == sectorId);
        result.Id.Should().Be(added.Id);
    }

    [Fact]
    public async Task CreateAsync_IgnoresIdFromDto()
    {
        var clientId = Guid.NewGuid();

        var result = await _sut.CreateAsync(new SubmissionDto(clientId, "Jane", [Guid.NewGuid()], true));

        result.Id.Should().NotBe(clientId);
        result.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task CreateAsync_TrimsName()
    {
        var result = await _sut.CreateAsync(new SubmissionDto(Guid.Empty, "  Jane  ", [Guid.NewGuid()], true));

        result.Name.Should().Be("Jane");
    }

    [Fact]
    public async Task CreateAsync_DeduplicatesSectors()
    {
        var sectorId = Guid.NewGuid();

        var result = await _sut.CreateAsync(new SubmissionDto(Guid.Empty, "Jane", [sectorId, sectorId], true));

        result.SectorIds.Should().Equal(sectorId);
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedAtAndUpdatedAt()
    {
        Submission? added = null;
        _repository.Setup(r => r.Add(It.IsAny<Submission>())).Callback<Submission>(s => added = s);
        var before = DateTime.UtcNow;

        await _sut.CreateAsync(new SubmissionDto(Guid.Empty, "Jane", [Guid.NewGuid()], true));

        added!.CreatedAt.Should().BeOnOrAfter(before);
        added.UpdatedAt.Should().Be(added.CreatedAt);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ReturnsNullAndDoesNotSave()
    {
        _repository.Setup(r => r.FindAsync(It.IsAny<Guid>())).ReturnsAsync((Submission?)null);

        var id = Guid.NewGuid();
        var result = await _sut.UpdateAsync(id, new SubmissionDto(id, "Jane", [Guid.NewGuid()], true));

        result.Should().BeNull();
        _repository.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ReplacesSectors_KeepingSharedOnes()
    {
        Guid a = Guid.NewGuid(), b = Guid.NewGuid(), c = Guid.NewGuid();
        var submission = SubmissionWithSectors(a, b);
        var keptLink = submission.SubmissionSectors.Single(ss => ss.SectorId == b);
        _repository.Setup(r => r.FindAsync(submission.Id)).ReturnsAsync(submission);

        var result = await _sut.UpdateAsync(submission.Id, new SubmissionDto(submission.Id, "Jane", [b, c], true));

        result!.SectorIds.Should().BeEquivalentTo([b, c]);
        submission.SubmissionSectors.Select(ss => ss.SectorId).Should().BeEquivalentTo([b, c]);
        submission.SubmissionSectors.Should().Contain(keptLink);
        _repository.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_DeduplicatesSectors()
    {
        var a = Guid.NewGuid();
        var submission = SubmissionWithSectors();
        _repository.Setup(r => r.FindAsync(submission.Id)).ReturnsAsync(submission);

        var result = await _sut.UpdateAsync(submission.Id, new SubmissionDto(submission.Id, "Jane", [a, a], true));

        result!.SectorIds.Should().Equal(a);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFieldsAndTimestamps()
    {
        var submission = SubmissionWithSectors(Guid.NewGuid());
        var createdAt = submission.CreatedAt;
        _repository.Setup(r => r.FindAsync(submission.Id)).ReturnsAsync(submission);

        var result = await _sut.UpdateAsync(submission.Id, new SubmissionDto(submission.Id, "  John  ", [Guid.NewGuid()], true));

        result!.Name.Should().Be("John");
        submission.Name.Should().Be("John");
        submission.CreatedAt.Should().Be(createdAt);
        submission.UpdatedAt.Should().BeAfter(createdAt);
    }
}
