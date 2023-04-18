namespace chat.Models;
public class Message
{
    public Message(int id, string content, string userName, DateTime createdAt)
    {
        Id = id;
        Content = content;
        UserName = userName;
        CreatedAt = createdAt;
    } // I can either have this function here or make them all optional parameters in the constructor

    public int Id { get; set; }

    public String Content { get; set; }

    public string UserName { get; set; }

    public DateTime CreatedAt { get; set; }

    public int ChannelId { get; set; }

    public Channel? Channel { get; set; }
}
