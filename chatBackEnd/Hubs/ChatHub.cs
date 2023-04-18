using Microsoft.AspNetCore.SignalR;


namespace chat.Hubs;

public class ChatHub : Hub
{
    // On connected
    public override Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
        return base.OnConnectedAsync();
    }
    

    // Send message to all clients
    public async Task SendMessage(string message)
    {
        Console.WriteLine($"Message received: {message}");
        await Clients.All.SendAsync("ReceiveMessage", message);
    }


    // Send message to a specific client
    public async Task AddToGroup(string groupName)
    {
        // verify and authenticate user if necessary


        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has joined the group {groupName}.");
    }


    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has left the group {groupName}.");
    }

    // On disconnected
    public override Task OnDisconnectedAsync(Exception exception)
    {
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        return base.OnDisconnectedAsync(exception);
    }
}

