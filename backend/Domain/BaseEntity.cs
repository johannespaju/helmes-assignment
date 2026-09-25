namespace Domain;

public abstract class BaseEntity
{
    public Guid Id { get; } = Guid.NewGuid();
}