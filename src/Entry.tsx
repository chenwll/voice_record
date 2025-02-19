import {memo, useState, useCallback, useEffect} from 'react';
import { Steps , Button} from 'antd-mobile'
import useCreateAudio, { CreateAudioStatus, MinRecordDuration } from './hooks/useCreateAudio';
import RecordAudio from './components/RecordAudio';
const { Step } = Steps;
const Entry = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [audioUrl, setAudioUrl] = useState('');

    const {
        status,
        setStatus,
        description,
        setDescription,
        recordDuration,
        startRecord,
        stopRecord,
        // showCountdown,
        resetRecord,
        resumeRecord,
        pausedRecord,
        
    } = useCreateAudio();

    // 清理音频 URL
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const publishRecord = useCallback(async () => {

        if (recordDuration < MinRecordDuration && status === CreateAudioStatus.RECORDING) {
            setStatus(CreateAudioStatus.FAIL);
            setDescription('录制时间过短，请重新录制');
            stopRecord();
            return;
        }

        try {
            const blob = await stopRecord();

            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            const formData = new FormData();
            formData.append('speechFile', new File([blob], 'speech.wav'));
            setStatus(CreateAudioStatus.UPLOADING);
            setCurrentStep(2);
            console.log(formData, '文件数据')
        } catch (e) {
            setStatus(CreateAudioStatus.FAIL);
            // message.error('录制失败，请重新录制');
            setDescription('录制失败，请重新录制');
        }
    }, [recordDuration, status, setStatus, setDescription, stopRecord]);

    const playAudio = useCallback(() => {
        if (!audioUrl) return;

        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
            console.error('播放失败:', error);
        });

        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl('');
        });
    }, [audioUrl, setDescription]);

    return (
        <div>
            <div>
                <Steps current={currentStep}>
                    <Step title='制作说明'  />
                    <Step title='正式录制'  />
                    <Step title='上传完成' />
                </Steps>
            </div>
            {
                currentStep === 0 && 
                <div>
                    <h1>录制说明</h1>
                    <div>
                    请您以真实直播的状态录制 准备： 手机请放在距您40厘米左右的位置麦克风朝向面部收音；直播本约3000字，确保可录制至少15分钟，录制更长时间有助于提升克隆音效果。
                    环境： 请确保网络状态良好，录制环境安静，避免噪音和混响，不要选择空旷的地方进行录制 录制： 录制过程中请保持声音连贯、吐字清晰、情感丰富，如果那个句子卡壳可重说一遍，尽量减少空白时间。
                    </div>
                    <br />
                    <div>
                        <Button  onClick={() => setCurrentStep(1)}>去录制</Button>
                        <h2>去录制</h2>
                    </div>
                </div>
            }
            {
                currentStep === 1 &&
                <div>
                    <h1>朗读示例</h1>
                    <div>
                    今天，咱们先说说医学的第一大基础共识。 没有医学，人类照样生存 你有没有想过这个问题：人类为什么需要医学？没有医学行不行？ 听起来，这个问题问得没意义。 所有人都知道，医学大大地延长了人类寿命。
                    现代医学诞生之初，人类的平均寿命是30岁。今天寿命最长的日本，平均预期寿命已经达到了84.2岁。 听起来，这个问题问得没意义。
                    </div>
                    <div>
                        <RecordAudio 
                            recordStatus={status}
                            description={description}
                            recordDuration={recordDuration}
                            startRecord={startRecord}
                            stopRecord={stopRecord}
                            resetRecord={resetRecord}
                            publishRecord={publishRecord}
                            resumeRecord={resumeRecord}
                            pausedRecord={pausedRecord}
                            
                        />
                    </div>
                </div>
            }
            {
                currentStep === 2 && <Button onClick={playAudio}>播放录音</Button>
            }
        </div>
    );
}

export default memo(Entry);
