namespace Domain;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.CreateVersion7(); // no real benefit of using this over guid4 in this case, but why not
}
