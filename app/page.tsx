"use client"
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Camera, FlipHorizontal, PersonStanding, Video, Volume2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Rings } from 'react-loader-spinner';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { beep } from '../utils/audio';
import { RenderFeatureHighlightsSection } from '@/components/RenderFeatureHighlightsSection';
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-cpu'
import * as cocossd from '@tensorflow-models/coco-ssd'
import { ObjectDetection, DetectedObject } from '@tensorflow-models/coco-ssd'
import { drawOnCanvas, resizeCanvas } from '@/utils/canvas';
import { formatDate } from '@/utils/date';
import { base64toBlob } from '@/utils/media';

let interval: any = null;
let stopTimeout: any = null;

const HomePage = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // state
  const [mirrored, setMirrored] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [model, setModel] = useState<ObjectDetection>();
  const [loading, setLoading] = useState<boolean>(false);

  // initialize media recorder
  useEffect(() => {
    if (webcamRef && webcamRef.current) {
      const stream = (webcamRef.current.video as any).captureStream();
      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e: any) => {
          if (e.data.size > 0) {
            const recordedBlob = new Blob([e.data], { type: 'video' });
            const videoURL = URL.createObjectURL(recordedBlob);

            const a = document.createElement('a');
            a.href = videoURL;
            a.download = `${formatDate(new Date())}.webm`;
            a.click();
          }
        };
        mediaRecorderRef.current.onstart = (_e) => {
          setIsRecording(true);
        }

        mediaRecorderRef.current.onstop = (_e) => {
          setIsRecording(false);
        }
      }
    }
  }, [webcamRef]);

  async function initModel() {
    const loadedModel: ObjectDetection = await cocossd.load({
      base: 'mobilenet_v2'
    })
    setModel(loadedModel)
  }

  useEffect(() => {
    setLoading(true)
    initModel()
  }, []);

  useEffect(() => {
    if (model) {
      setLoading(false);
    }
  }, [model]);

  const startRecording = useCallback((doBeep: boolean) => {
    if (webcamRef.current && mediaRecorderRef.current?.state !== 'recording') {
      mediaRecorderRef.current?.start();
      doBeep && beep(volume);

      stopTimeout = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    }
  }, [volume])

  const runPredictions = useCallback(async () => {
    if (model && webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
      const predictions: DetectedObject[] = await model.detect(webcamRef.current.video);
      resizeCanvas(canvasRef, webcamRef)
      drawOnCanvas(mirrored, predictions, canvasRef.current?.getContext('2d'));

      let isPerson: boolean = false;
      if (predictions.length > 0) {
        predictions.forEach((prediction: DetectedObject) => {
          isPerson = prediction.class === "person";
        })

        if (isPerson && autoRecordEnabled) {
          startRecording(true);
        }
      }
    }
  }, [autoRecordEnabled, mirrored, model, startRecording])

  useEffect(() => {
    interval = setInterval(() => {
      runPredictions();
    }, 100)

    return () => clearInterval(interval)
  }, [model, mirrored, autoRecordEnabled, runPredictions])

  // handle functions
  const userPromptScreenshot = () => {
    // take picture 
    if (!webcamRef.current) {
      toast('Camera not found. Please refresh the page and try again.')
    } else {
      const imgSrc = webcamRef.current.getScreenshot();
      const blob = base64toBlob(imgSrc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formatDate(new Date())}.png`;
      a.click();
    }

    // save it to downloads

  }

  const userPromptRecord = () => {
    if (!webcamRef.current) {
      toast('Camera not found. Please refresh the page and try again.')
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current?.requestData();
      clearTimeout(stopTimeout);
      mediaRecorderRef.current?.stop();
      toast('Recording saved to downloads.')
    } else {
      startRecording(false);
    }
  }

  const toggleAutoRecord = () => {
    if (autoRecordEnabled) {
      setAutoRecordEnabled(false);
      toast('Auto Recording disabled');
      // show toast to user to notify the change
    } else {
      setAutoRecordEnabled(true);
      toast('Auto Recording enabled');
      // show toast
    }

  }

  return (
    <div className="flex h-screen">
      {/* Left division - webcam and canvas */}
      <div className="relative">
        <div className="relative h-screen w-full">
          <Webcam ref={webcamRef}
            mirrored={mirrored}
            className='h-full w-full object-contain p-2'
          />
          <canvas ref={canvasRef} className='absolute top-0 left-0 h-full w-full object-contain'>
          </canvas>
        </div>
      </div>
      {/* Right division - container */}
      <div className="flex flex-row flex-1">
        <div className="border-primary/5 border-2 max-w-xs flex flex-col gap-2 justify-between shadow-md rounded-md p-4">
          {/* top section */}
          <div className="flex flex-col gap-2">
            <ModeToggle />
            <Button
              onClick={() => setMirrored(prev => !prev)}
              variant={'outline'} size={'icon'}
            >
              <FlipHorizontal />
            </Button>
            <Separator className='my-2' />
          </div>

          {/* middle section */}
          <div className="flex flex-col gap-2">
            <Separator className='my-2' />
            <Button
              variant={'outline'}
              size={'icon'}
              onClick={userPromptScreenshot}
            >
              <Camera />
            </Button>
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size={'icon'}
              onClick={userPromptRecord}
            >
              <Video />
            </Button>
            <Separator className='my-2' />
            <Button
              variant={autoRecordEnabled ? 'destructive' : 'outline'}
              size={'icon'}
              onClick={toggleAutoRecord}
            >
              {autoRecordEnabled ? <Rings color='white' height={45} /> : <PersonStanding />}
            </Button>
          </div>

          {/* bottom section */}
          <div className="flex flex-col gap-2">
            <Separator className='my-2' />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  size={'icon'}
                >
                  <Volume2 />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Slider
                  max={1}
                  min={0}
                  step={0.2}
                  defaultValue={[volume]}
                  onValueCommit={(val) => {
                    setVolume(val[0]);
                    beep(val[0]);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="h-full flex-1 py-4 px-2 overflow-y-scroll">
          <RenderFeatureHighlightsSection
            setMirrored={setMirrored}
            userPromptScreenshot={userPromptScreenshot}
            userPromptRecord={userPromptRecord}
            isRecording={isRecording}
            autoRecordEnabled={autoRecordEnabled}
            toggleAutoRecord={toggleAutoRecord}
          />
        </div>
      </div>
      {loading && <div className="z-50 absolute w-full h-full flex items-center justify-center bg-primary-foreground">
        Getting things ready . . . <Rings height={50} color='red' />
      </div>}
    </div>
  )
}

export default HomePage