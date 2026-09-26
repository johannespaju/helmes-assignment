using DAL;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace WebApp.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"test-{Guid.NewGuid():N}";
    private SqliteConnection? _keepAliveConnection;

    private string ConnectionString => $"DataSource=file:{_dbName}?mode=memory&cache=shared";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services
                .SingleOrDefault(d => d.ServiceType == typeof(IDbContextOptionsConfiguration<AppDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            var descriptorDbContext = services
                .SingleOrDefault(d => d.ServiceType == typeof(AppDbContext));
            if (descriptorDbContext != null) services.Remove(descriptorDbContext);

            if (_keepAliveConnection == null)
            {
                _keepAliveConnection = new SqliteConnection(ConnectionString);
                _keepAliveConnection.Open();
            }

            services.AddDbContext<AppDbContext>(options => options.UseSqlite(ConnectionString));
        });
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _keepAliveConnection?.Dispose();
            _keepAliveConnection = null;
        }
        base.Dispose(disposing);
    }
}
