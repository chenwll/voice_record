import {memo, useMemo} from 'react';
import {Button} from "antd-mobile";
import {CreateAudioStatus} from "../hooks/useCreateAudio.ts";


interface RecordAudioProps {
    /** 录音状态 */
    recordStatus: CreateAudioStatus;
    /** 录音步骤引导 */
    description: string;
    /** 录音时长 */
    recordDuration: number;
    /** 开始录音点击事件 */
    startRecord: () => void;
    /** 停止录音点击事件 */
    stopRecord: () => void;
    /** 重录点击事件 */
    resetRecord: () => void;
    /** 发布点击事件 */
    publishRecord: () => void;
    /** 继续录音点击事件 */
    resumeRecord: () => void;
    /** 暂停录音点击事件 */
    pausedRecord: () => void;
}

const RecordAudio = ({
    recordStatus,
    description,
    recordDuration,
    startRecord,
    // stopRecord,
    resetRecord,
    publishRecord,
    resumeRecord,
    pausedRecord,
}: RecordAudioProps) => {

    const buildRecordBtn = useMemo(() => {
        switch (recordStatus) {
            case CreateAudioStatus.NONE:
                return <Button onClick={startRecord}>开始录音</Button>;
            case CreateAudioStatus.RECORDING:
                return (
                    <div>
                        <Button onClick={resetRecord}>重录</Button>
                        <Button onClick={pausedRecord}>暂停录音</Button>
                        <Button onClick={publishRecord} disabled={recordDuration < 10}> 发布</Button>
                    </div>
                );
            case CreateAudioStatus.PAUSE:
                return (
                    <div>
                        <Button onClick={resetRecord}>重录</Button>
                        <Button onClick={resumeRecord}>继续录音</Button>
                        <Button onClick={publishRecord} disabled={recordDuration < 10}> 发布</Button>
                </div>
                );
            default:
                return null;
        }


    },[pausedRecord, publishRecord, recordDuration, recordStatus, resetRecord, resumeRecord, startRecord]);
    return (
        <div>
            {
                (recordStatus === CreateAudioStatus.PAUSE || recordStatus === CreateAudioStatus.RECORDING ) && (
                    <h1>正在录音 {recordDuration}</h1>
                )
            }
            {
                buildRecordBtn
            }
            <h2>引导提示：{description}</h2>
        </div>
    )
}

export default memo(RecordAudio);