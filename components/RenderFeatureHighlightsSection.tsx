import { Camera, FlipHorizontal, MoonIcon, PersonStanding, SunIcon, Video } from "lucide-react"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { Rings } from "react-loader-spinner"
import { Dispatch, SetStateAction } from "react"
import SocialMediaLinks from "./social-links"


type RenderFeatureHighlightsSectionProps = {
  setMirrored: Dispatch<SetStateAction<boolean>>;
  userPromptScreenshot: () => void;
  userPromptRecord: () => void;
  isRecording: boolean;
  autoRecordEnabled: boolean;
  toggleAutoRecord: ()=> void;
}

export function RenderFeatureHighlightsSection({
  setMirrored,
  userPromptScreenshot,
  userPromptRecord,
  isRecording,
  autoRecordEnabled,
  toggleAutoRecord,
}: RenderFeatureHighlightsSectionProps) {
  return <div className="text-xs text-muted-foreground">
    <ul className="space-y-4">
      <li>
        <strong>Dark Mode/Sys Theme 🌗</strong>
        <p>Toggle between dark mode and system theme.</p>
        <Button className="my-2 h-6 w-6" variant={"outline"} size={"icon"}>
          <SunIcon size={14} />
        </Button>{" "}
        /{" "}
        <Button className="my-2 h-6 w-6" variant={"outline"} size={"icon"}>
          <MoonIcon size={14} />
        </Button>
      </li>
      <li>
        <strong>Horizontal Flip ↔️</strong>
        <p>Adjust horizontal orientation.</p>
        <Button className='h-6 w-6 my-2'
          variant={'outline'} size={'icon'}
          onClick={() => {
            setMirrored((prev: boolean) => !prev)
          }}
        ><FlipHorizontal size={14} /></Button>
      </li>
      <Separator />
      <li>
        <strong>Take Pictures 📸</strong>
        <p>Capture snapshots at any moment from the video feed.</p>
        <Button
          className='h-6 w-6 my-2'
          variant={'outline'} size={'icon'}
          onClick={userPromptScreenshot}
        >
          <Camera size={14} />
        </Button>
      </li>
      <li>
        <strong>Manual Video Recording 📽️</strong>
        <p>Manually record video clips as needed.</p>
        <Button className='h-6 w-6 my-2'
          variant={isRecording ? 'destructive' : 'outline'} size={'icon'}
          onClick={userPromptRecord}
        >
          <Video size={14} />
        </Button>
      </li>
      <Separator />
      <li>
        <strong>Enable/Disable Auto Record 🚫</strong>
        <p>
          Option to enable/disable automatic video recording whenever
          required.
        </p>
        <Button className='h-6 w-6 my-2'
          variant={autoRecordEnabled ? 'destructive' : 'outline'}
          size={'icon'}
          onClick={toggleAutoRecord}
        >
          {autoRecordEnabled ? <Rings color='white' height={30} /> : <PersonStanding size={14} />}

        </Button>
      </li>

      <li>
        <strong>Volume Slider 🔊</strong>
        <p>Adjust the volume level of the notifications.</p>
      </li>
      <li>
        <strong>Camera Feed Highlighting 🎨</strong>
        <p>
          Highlights persons in{" "}
          <span style={{ color: "#FF0F0F" }}>red</span> and other objects in{" "}
          <span style={{ color: "#00B612" }}>green</span>.
        </p>
      </li>
      <Separator />
      <li className="space-y-4">
        <strong>Share your thoughts 💬 </strong>
        <SocialMediaLinks />
        <br />
        <br />
        <br />
      </li>
    </ul>
  </div>
}