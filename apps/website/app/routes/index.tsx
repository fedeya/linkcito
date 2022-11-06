import { HiCheck } from 'react-icons/hi';

export default function Index() {
  return (
    <div className="h-full w-full max-w-xl mx-auto pt-20 gap-4">
      <div className="flex flex-col justify-center items-center gap-8">
        <h1 className="text-3xl font-medium leading-snug text-white text-center">
          Do not waste the important <br /> resources of your server!
        </h1>

        <ul className="flex flex-col sm:flex-row sm:items-center gap-4">
          <li className="flex gap-2 items-center">
            <HiCheck className="text-green-500" /> Tags
          </li>

          <li className="flex gap-2 items-center">
            <HiCheck className="text-green-500" /> Modern dashboard
          </li>

          <li className="flex gap-2 items-center">
            <HiCheck className="text-green-500" /> Slash commands
          </li>
        </ul>

        <a
          className="bg-action w-fit px-8 py-3 rounded-md text-lg font-medium text-center text-white"
          href="https://discord.com/api/oauth2/authorize?client_id=1037163235901722705&permissions=277025392640&scope=bot"
        >
          Add to Discord
        </a>
      </div>

      <div></div>
    </div>
  );
}
