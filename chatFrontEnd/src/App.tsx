import { useEffect, useRef, useState } from "react";
import "./App.css";
import ChannelsSideBar from "../components/ChannelsSideBar";
import useSignalR from "./useSignalR";
import axios from "axios";

type Message = {
  id: number;
  content: string;
  user: User;
  channelId: number;
  createdAt: Date;
};

type Channel = {
  id: number;
  name: string;
  createdAt: Date;
  users: User[];
  messages: Message[];
};

type User = {
  id: number;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
  channels: Channel[];
};

export default function App() {
  const { connection } = useSignalR("/r/chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState<boolean>(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [currentEditedMessage, setCurrentEditedMessage] =
    useState<Message | null>();
  const [currentEditedChannel, setCurrentEditedChannel] =
    useState<Channel | null>();
  const messageListRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get<Channel[]>("api/channels/");
        setChannels(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // shared state between the msgs and the channels side bar to see which one is active and the msgs are displayed

  useEffect(() => {
    if (connection) {
      connection.on("ReceiveMessage", (newMessage: Message) => {
        // console.log("new message", newMessage)
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      connection.on("MessageDeleted", (messageId: number) => {
        setMessages((prevMessages) =>
          prevMessages.filter((m) => m.id !== messageId)
        );
      });

      connection.on("MessageUpdated", (message: Message) => {
        setMessages((prevMessages) =>
          prevMessages.map((m) => {
            if (m.id === message.id) {
              return message;
            }
            return m;
          })
        );
      });

      connection.on("ReceiveChannel", (newChannel: Channel) => {
        setChannels((prevChannels) => [...prevChannels, newChannel]);
      });

      connection.on("ChannelDeleted", (channelId: number) => {
        setChannels((prevChannels) =>
          prevChannels.filter((m) => m.id !== channelId)
        );
      });

      connection.on("ChannelUpdated", (channel: Channel) => {
        setChannels((prevChannels) =>
          prevChannels.map((c) => {
            if (c.id === channel.id) {
              return channel;
            }
            return c;
          })
        );
      });

      connection.on("UserUpdated", (user: User) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === user.id) {
              return user;
            }
            return u;
          })
        );
        setMessages((prevMessages) =>
          prevMessages.map((m) => {
            if (m.user.id === user.id) {
              m.user = user;
            }
            return m;
          })
        );
      });

      connection.on("UserJoined", (user: User) => {
        // console.log("user joined", user)
        setUsers((prevUsers) => [...prevUsers, user]);
      });

      connection.on("UserLeft", (userId: number) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      });
    }

    return () => {
      connection?.off("MessageDeleted");
      connection?.off("MessageUpdated");
      connection?.off("ReceiveChannel");
      connection?.off("ChannelDeleted");
      connection?.off("ChannelUpdated");
      connection?.off("UserUpdated");
      connection?.off("UserJoined");
      connection?.off("UserLeft");
    };
  }, [connection]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/channels/${currentChannel?.id}`);
        const data = response.data;
        console.log("data", data);
        setMessages(data.messages);
        setUsers(data.users);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => {
      connection.off("AddToGroup");
    };
  }, [currentChannel, connection]);

  async function joinUserToChannel(channel: Channel, user?: User) {
    if (user?.channels.find((c) => c.id === channel.id)) {
      setCurrentChannel(channel);
    } else {
      await connection?.invoke("AddToGroup", channel.id);

      user?.channels.splice(0);
      const { data } = await axios.post<User>(
        `/api/channels/${channel?.id}/users`,
        user
      );
      setCurrentUser(data);

      setCurrentChannel(channel);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("currentChannel", currentChannel);
    console.log("channelId", channelId);
    const result = await fetch(`/api/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        userName: "muraD",
      }),
    });
    // .then((res) => res.json());
    // const newMessage = {
    //   id: result.id,
    //   content: result.content,
    //   userName: result.userName,
    //   channelId: result.channelId,
    //   createdAt: new Date(result.createdAt),
    // };
    setMessage("");
  };

  function formatDate(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-row h-screen w-screen">
      <div className="bg-gray-400 h-full overflow-y-auto w-300">
        <ChannelsSideBar
          setChannelId={setChannelId}
          handlejoinUserToChannel={joinUserToChannel}
        />
      </div>

      <div className="bg-green-100 flex-1">
        <div className="p-4 h-full flex flex-col justify-end">
          <div className="mb-4 flex-1 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="flex justify-end mb-2">
                <div className="rounded-lg p-2 max-w-md bg-blue-500 text-white">
                  <p className="text-sm leading-snug">{message.content}</p>
                </div>
                <div className="text-right text-xs text-gray-500 ml-2 self-end">
                  {formatDate(message.createdAt)}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 mr-2 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
