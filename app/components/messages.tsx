type commandType = {
  command: string;
  response: string;
};

type messageType = {
  message: string;
  showInput: boolean;
  noActionRequired?: boolean;
  terminalResponse?: commandType[];
};

const MESSAGES: messageType[] = [
  { message: `Do you believe in second chances? [Y/n]`, showInput: true },
  {
    message: `Once upon a time, on a dark, stormy night…
    A dark crystal orb lies serenely on its cushion, shining with an unnatural glow in a crumbling room filled with cobwebs and the reminder of a once-royal family. 
    Deep inside the orb, an image forms. A shadowy figure, lean and tall, slips unnoticed into a farmer’s cottage. Laughter peals from the next room. Thunder strikes above. The figure flickers in the lightning, his dagger sharpened by hunger and thirsty for new blood. He strikes. 
    
    Press SPACE to continue`,
    showInput: false,
    noActionRequired: true,
  },
  {
    message: `Detective. I trust you are well. 
    There has been another attack. The new files are ready for cloning. 
    Take a look at your earliest convenience. 
    — HQ
    
    Press SPACE to continue`,
    showInput: false,
    noActionRequired: true,
  },
  {
    message: `Well, my dearest visitor. It seems like you have most… unfortune timing. It pains me greatly to ask this of you, but I am but a lowly farmer, and it would not serve me well to be involved in this case. My father has forbade us from such… activities ever since his encounter with that inglourious basterd. I am sure you would understand. It pains me dearly, but I must leave this case in your hands. 
    I trust the general’s letter has given you enough information to start. 
    Godspeed, soldier.
    
    Press SPACE to continue`,
    showInput: false,
    noActionRequired: true,
  },
  {
    message: `TASK 1: Clone the files.`,
    showInput: true,
    terminalResponse: [
      {
        command: "open PRIVATE_URL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED",
        response: "SUPER-SECRET-URL-DO-NOT-COPY-ME",
      },
      {
        command: "ls",
        response: `Files: PRIVATE_URL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`,
      },
    ],
  },
  {
    message: `TASK 2: Find the username and password.`,
    showInput: true,
  },
  {
    message: `TASK 3: Log in.`,
    showInput: true,
  },
  {
    message: `Are you sure?`,
    showInput: false,
  },
  {
    message: `Task 4: Killer???`,
    showInput: false,
  },
];

export { MESSAGES };
