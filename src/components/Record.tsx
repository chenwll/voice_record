import {Button} from 'antd'
import {CreateAudioStatus} from "../hooks/useCreateAudio.ts";

interface RecordAudioProps {
    /** 录音状态 */
    recordStatus: CreateAudioStatus;
    /** 录音步骤引导 */
    guideText: string;
    /** 录音时长 */
    recordDuration: number;
    /** 开始录音点击事件 */
    onStartRecordClick: () => void;
    /** 停止录音点击事件 */
    onStopRecordClick: () => void;
}

export const Record = ({
                           recordStatus,
                           guideText,
                           recordDuration,
                           onStartRecordClick,
                           onStopRecordClick
                       }:RecordAudioProps) => {
    return (
        <div>
            <div>{recordStatus}</div>
            <div>{guideText}</div>
            <div>{recordDuration}</div>
            {
                recordStatus === CreateAudioStatus.NONE && (
                    <Button onClick={onStartRecordClick}>开始录制</Button>
                )
            }
            {
               ( recordStatus === CreateAudioStatus.RECORDING || recordStatus === CreateAudioStatus.UPLOADING) && (
                    <Button onClick={onStopRecordClick}>停止录制</Button>
                )
            }

        </div>
    )
}