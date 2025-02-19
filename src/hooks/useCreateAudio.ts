import {useRef, useState, useCallback, useEffect, useMemo} from 'react';
import {AudioRecorder} from '../utils/audio-recorder';

// tts 语音合成最小音频时长 15s，防止容易触发 15s 的临界值，这里设置为 16s
export const MinRecordDuration = 16;

// tts 语音合成最大音频时长 60s，防止容易触发 60s 的临界值，这里设置为 59s
export const MaxRecordDuration = 59;


// 录音文本
export const RecordText =
    '嘿，你知道吗？今天街上的人特别多，简直比平时热闹了好几倍。大家都忙着购物、吃饭，街上的每个角落都充满了欢声笑语。我也被这种热闹的氛围吸引，感觉真是不错！';

export enum CreateAudioStatus {
    // 初始
    NONE = 'none',
    // 正在录音
    RECORDING = 'recording',
    // 正在上传
    UPLOADING = 'uploading',
    // 上传成功
    SUCCESS = 'success',
    // 上传失败
    FAIL = 'fail',
    // 暂停
    PAUSE = 'pause',
}

export enum CreateAudioGuideText {
    NONE = '点击开始朗读 或自由发挥',
    RECORDING = '可点击暂停',
    PAUSE = '可点击继续录制',
}



/**
 * @description
 * 使用useCreateAudio Hook来管理录音功能。包括：
 * 1. 初始化录音实例、状态和描述等数据；
 * 2. 开始录音、停止录音、重置数据等操作；
 * 3. 显示倒计时；
 * 4. 处理错误信息和提示信息。
 *
 * @returns {Object} 返回一个对象，包含以下属性：
 * - status {CreateAudioStatus} 当前录音状态，默认值为 CreateAudioStatus.NONE；
 * - setStatus {Function} 更新当前录音状态的函数；
 * - description {string} 当前录音状态的描述，默认值为 DefaultDescription；
 * - recordDuration {number} 当前录音时长，单位为秒，默认值为 0；
 * - setDescription {Function} 更新当前录音状态的描述的函数；
 * - startRecord {Function} 开始录音的函数；
 * - stopRecord {Function} 停止录音的函数；
 * - reset {Function} 重置数据的函数；
 * - showCountdown {boolean} 是否显示倒计时，开始录制到14秒后（后10秒），显示倒计时；
 */
export default function useCreateAudio() {
    // 录音状态
    const [status, setStatus] = useState(CreateAudioStatus.NONE);
    // 录音过程的错误信息或者提示信息
    const [description, setDescription] = useState<string>(CreateAudioGuideText.NONE);
    // 记录录音时长的定时器
    const recordDurationIntervalRef = useRef<NodeJS.Timeout>(null);
    // 录音时长
    const [recordDuration, setRecordDuration] = useState<number>(0);
    // 录音实例
    const {current: audioRecorder} = useRef<AudioRecorder>(new AudioRecorder());

    // 是否显示倒计时，开始录制到14秒后（后10秒），显示倒计时
    const showCountdown = useMemo(() => {
        return recordDuration < MaxRecordDuration && recordDuration >= MaxRecordDuration - 10;
    }, [recordDuration]);

    // 开始录制
    const startRecord = useCallback(async () => {
        try {
            await audioRecorder.start();
            setStatus(CreateAudioStatus.RECORDING);
            setDescription(CreateAudioGuideText.RECORDING);
            setRecordDuration(0);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            recordDurationIntervalRef.current && clearInterval(recordDurationIntervalRef.current);
            recordDurationIntervalRef.current = setInterval(() => {
                setRecordDuration(prevState => prevState + 1);
            }, 1000);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error(e);
            // message.error(e?.message);
        }
    }, [audioRecorder]);

    // 停止录音
    const stopRecord = useCallback(() => {
        setRecordDuration(0);
        setDescription(CreateAudioGuideText.NONE);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        recordDurationIntervalRef.current && clearInterval(recordDurationIntervalRef.current);
        return audioRecorder.stop();
    }, [audioRecorder]);

    // 重新录音
    const resetRecord = useCallback(async() => {
        await stopRecord();
        await startRecord();
    }, [startRecord, stopRecord]);

    // 达到最大录制时长时停止录音并设置为失败状态
    useEffect(() => {
        if (recordDuration === MaxRecordDuration) {
            setDescription('录音超时，请重新录制');
            setStatus(CreateAudioStatus.FAIL);
            stopRecord();
        }
    }, [recordDuration, stopRecord]);

    // 暂停录音
    const pausedRecord = useCallback(() => {
        setStatus(CreateAudioStatus.PAUSE);
        setDescription(CreateAudioGuideText.PAUSE);
        recordDurationIntervalRef.current && clearInterval(recordDurationIntervalRef.current);
        return audioRecorder.pause();
    }, [audioRecorder]);

    // 继续录音
    const resumeRecord = useCallback(() => {
        audioRecorder.resume();
        setStatus(CreateAudioStatus.RECORDING);
        recordDurationIntervalRef.current = setInterval(() => {
            setRecordDuration(prevState => prevState + 1);
        }, 1000);
    }, [audioRecorder]);

    // 卸载组件时重置数据并停止录音
    useEffect(
        () =>  {
            stopRecord();
        },
        [stopRecord]
    );

    return {
        status,
        setStatus,
        description,
        recordDuration,
        setDescription,
        startRecord,
        stopRecord,
        resetRecord,
        showCountdown,
        pausedRecord,
        resumeRecord
    };
}
