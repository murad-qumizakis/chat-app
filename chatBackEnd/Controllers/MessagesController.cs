using chat.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using chat.Hubs;

namespace chat.Controllers;


[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly DatabaseContext _context;

    private readonly IHubContext<ChatHub> _hub;

    public MessagesController(DatabaseContext context, IHubContext<ChatHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Message>>> GetMessages()
    {
        return await _context.Messages.ToListAsync();
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Message>> GetMessage(int id)
    {
        var Message = await _context.Messages.FindAsync(id);

        if (Message == null)
        {
            return NotFound();
        }

        return Message;
    }

    [HttpPost]
    public async Task<ActionResult<Message>> PostMessage(Message Message)
    {
        _context.Messages.Add(Message);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMessage), new { id = Message.Id }, Message);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> PutMessage(int id, Message Message)
    {
        if (id != Message.Id)
        {
            return BadRequest();
        }

        _context.Entry(Message).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        await _hub.Clients.Group(Message.ChannelId.ToString()).SendAsync("MessageUpdated", Message);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMessage(int id)
    {
        var Message = await _context.Messages.FindAsync(id);
        if (Message == null)
        {
            return NotFound();
        }

        _context.Messages.Remove(Message);
        await _context.SaveChangesAsync();

        await _hub.Clients.Group(Message.ChannelId.ToString()).SendAsync("MessageDeleted", Message.Id);

        return NoContent();
    }
}