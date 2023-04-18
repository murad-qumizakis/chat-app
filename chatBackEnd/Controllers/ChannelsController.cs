using chat.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using chat.Hubs;

namespace chat.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChannelsController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<ChatHub> _hub;

    public ChannelsController(DatabaseContext context, IHubContext<ChatHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Channel>>> GetChannels()
    {
        return await _context.Channels.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Channel>> GetChannel(int id)
    {
        var Channel = await _context.Channels.FindAsync(id);

        if (Channel == null)
        {
            return NotFound();
        }

        return Channel;
    }

    [HttpPost]
    public async Task<ActionResult<Channel>> PostChannel(Channel Channel)
    {
        _context.Channels.Add(Channel);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChannel), new { id = Channel.Id }, Channel);
    }

    // POST: api/Channels/5/Messages
    [HttpPost("{channelId}/Messages")] // the "channelId" is the name of the parameter
    public async Task<ActionResult<Message>> PostChannelMessage(int channelId, Message message) // here is the name of the paramater
    {
        Console.WriteLine("HELLOOOOOyuke" + channelId);
        Console.WriteLine(_context.Channels.Find(channelId) + " HELLOOOOO" );
        // Message.ChannelId = channelId; // here we are linking the message to the channel
        // var channel = _context.Channels.Find(channelId); // here we are adding the message to the database
        // channel?.Messages.Add(Message);

        message.ChannelId = channelId;
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // _context.Entry(channel).State = EntityState.Modified;
        // await _context.SaveChangesAsync(); // here we are saving the changes to the database
        // await _hub.Clients.All.SendAsync("ReceiveMessage", Message); // here we are sending the message to the client, we are sending the entire message object here
        // return message; // here we are returning the message, the return here has to be the same type as the method which is on line 48 "<Message>"
        return CreatedAtAction(nameof(GetChannel), new { id = message.Id }, message);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutChannel(int id, Channel Channel)
    {
        if (id != Channel.Id)
        {
            return BadRequest();
        }

        _context.Entry(Channel).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChannel(int id)
    {
        var Channel = await _context.Channels.FindAsync(id);
        if (Channel == null)
        {
            return NotFound();
        }

        _context.Channels.Remove(Channel);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}