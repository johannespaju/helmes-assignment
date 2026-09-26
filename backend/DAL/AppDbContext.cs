using DAL.Seeding;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace DAL;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Person> Persons => Set<Person>();
    public DbSet<Sector> Sectors => Set<Sector>();
    public DbSet<PersonSector> PersonSectors => Set<PersonSector>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Sector>().HasData(SectorSeed.Sectors);
    }
}
