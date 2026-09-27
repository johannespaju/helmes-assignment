using DAL.Seeding;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace DAL;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<Sector> Sectors => Set<Sector>();
    public DbSet<SubmissionSector> SubmissionSectors => Set<SubmissionSector>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Sector>().HasData(SectorSeed.Sectors);
    }
}
