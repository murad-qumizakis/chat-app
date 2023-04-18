namespace chat.Models;

public class Channel
{
    public Channel(int id, string name, DateTime createdAt)
    {
        Id = id;
        Name = name;
        CreatedAt = createdAt;
        Messages = new List<Message>();
    }

    public int Id { get; set; }

    public String Name { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public List<Message> Messages { get; set; } = null!;

}

