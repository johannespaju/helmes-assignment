using DAL;
using Domain;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace WebApp.Tests.Integration.DAL;

public abstract class RepositoryTestBase : IAsyncLifetime
{
    protected readonly SqliteConnection Connection;
    protected readonly DbContextOptions<AppDbContext> ContextOptions;

    protected RepositoryTestBase()
    {
        Connection = new SqliteConnection("DataSource=:memory:");
        Connection.Open();

        ContextOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(Connection)
            .Options;
    }

    public async Task InitializeAsync()
    {
        await using var ctx = CreateContext();
        await ctx.Database.EnsureCreatedAsync();
    }

    public Task DisposeAsync()
    {
        Connection.Close();
        Connection.Dispose();
        return Task.CompletedTask;
    }

    protected AppDbContext CreateContext() => new(ContextOptions);

    protected async Task<Guid> AddSubmissionDirectlyAsync(string name, params Guid[] sectorIds)
    {
        var submission = new Submission
        {
            Name = name,
            AgreeToTerms = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            SubmissionSectors = sectorIds.Select(id => new SubmissionSector { SectorId = id }).ToList()
        };

        await using var ctx = CreateContext();
        ctx.Submissions.Add(submission);
        await ctx.SaveChangesAsync();
        return submission.Id;
    }
}
