# AssemblyAI Streaming Transcription NextJs Example

## How To Install and Run the Project

##### ❗Important❗

- Before running this app, you need to upgrade your AssemblyAI account. The Streaming API is only available to upgraded accounts.
- To upgrade your account you need to add a card. You can do that in your dashboard [here](https://app.assemblyai.com/)!

##### Instructions

1. Clone the repo to your local machine.
2. Open a terminal in the main directory housing the project. In this case `streaming-nextjs-file`.
3. Run `npm install` to ensure all dependencies are installed.
4. Add your AssemblyAI key to line 8 in `src/app/api/token/route.js`.
5. Start the app with the command `npm run dev` .
6. Vist `http://localhost:3000/` in the browser. Chose a `wav` file and click "Start Transcription" to receive an immediate transcript.

#### Audio Requirments 
- Ensure your file meets the [audio requirments](https://www.assemblyai.com/docs/speech-to-text/streaming#audio-requirements).
- `wav` format produces the best results.
- See example.wav in this repo for an example.

