import { useEffect, useState } from "react";
import useSignalR from "../src/useSignalR";
import Channel from "./Channel";
import "../src/App.css";

type Channel = {
  id: number;
  name: string;
  CreatedAt: Date;
};

type Message = {
  id: number;
  content: string;
  userName: string;
  channelId: number;
  createdAt: Date;
};

type ChannelsSideBarProps = {
  setChannelId: React.Dispatch<React.SetStateAction<number | null>>;
  handlejoinUserToChannel: (channelId: number) => void | Promise<void>;
};

export default function ChannelsSideBar({
  setChannelId,
  handlejoinUserToChannel,
}: ChannelsSideBarProps) {
  const { connection } = useSignalR("/r/chat");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelName, setChannelName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    console.log("USE EFFECT");
    if (!connection) {
      return;
    }
    const fetchChannels = async () => {
      const result = await fetch("/api/channels").then((res) => res.json());
      console.log("RESULT: ", result);

      setChannels(result);
    };
    fetchChannels();
    console.log("CHANNELS: ", channels);

    return () => {
      connection.off("ReceiveMessage");
    };
  }, [connection]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(channelName);
    // if(connection){
    //     connection.invoke("createGroup", channelName)
    //     console.log("channel created")
    // }
    // setChannels((channels) => [...channels, {Id: 1, Name: channelName, CreatedAt: new Date()}])
    const result = await fetch("/api/channels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: channelName,
      }),
    }).then((res) => res.json());
    // connection?.invoke("createGroup", result.name)
    setChannels([...channels, result]);
    setChannelName("");
    console.log(result);
  }

  useEffect(() => {
    if (!connection) {
      return;
    }

    connection.on("Send", (message: string) => {
      // console.log(message);
    });

    // connection.on("ReceiveMessage", (message: Message) => {
    //   // debugger
    //   message.createdAt = new Date(message.createdAt);
    //   setMessages((messages) => [...messages, message]);
    //   // console.log("from the server" , message);
    // });

    return () => {
      connection.off("Send");
    };
  }, [connection]);

  function handleChannelClick(channelId: number) {
    console.log(`Clicked on channel ${channelId}`);
    setChannelId(channelId);
    // handlejoinUserToChannel(channelId);
    connection?.invoke("AddToGroup", channelId + "");
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-3xl font-bold font-thin ">Channels</h1>
        <div className="flex flex-col gap-2 items-center">
          <h3 className="text-med font-small pl-2 font-semiBold">
            Create new Channel
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Channel Name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="flex-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create
            </button>
          </form>
        </div>
        <div className="flex flex-col gap-2">
          {channels.map((channel) => (
            <Channel
              key={channel.id}
              channelName={channel.name}
              onClick={() => handleChannelClick(channel.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
