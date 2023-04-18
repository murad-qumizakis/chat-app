import "../src/App.css"
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';


type Props = {
    channelName: string;
    onClick: () => void;
}

export default function Channel({channelName, onClick}: Props){


    return (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-300" onClick={onClick}>
      <span className="text-gray-800 font-medium mr-4 font-thin " >{channelName}</span>
      <div className="flex items-center space-x-4">
      <a href="#" className="text-gray-500 hover:text-gray-800">
          <PencilIcon className="h-5 w-5" />
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-800">
          <TrashIcon className="h-5 w-5" />
        </a>
      </div>
    </div>

    )
}