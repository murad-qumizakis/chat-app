using Microsoft.EntityFrameworkCore;

namespace chat.Models;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Channel>().Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        modelBuilder.Entity<Message>().Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        modelBuilder.Entity<User>().Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        modelBuilder.Entity<User>().Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
      
        // Seed the user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "Murad",
        },
        new User
        {
            Id = 2,
            Username = "Jane",
        });

        
    }

    public DbSet<Channel> Channels => Set<Channel>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<User> Users => Set<User>();

}
