/**
 * @file 录音
 * @author hejinfeng01
 */
import {getWaveBlob} from 'webm-to-wav-converter';

export class AudioRecorder {
    private mediaRecorder?: MediaRecorder;
    private mediaStream?: MediaStream;
    private recordedBlobs?: Blob;

    async start() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('浏览器不支持录音');
        }
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.mediaRecorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    this.recordedBlobs = event.data;
                }
            };
            this.mediaRecorder.start();
        } catch (e: any) {
            // 此处异常一般都是没有权限导致，因此提示用户去浏览器设置页开启权限
            throw new Error('浏览器拒绝了录音权限，请去浏览器设置页开启权限');
        }
    }

    stop(): Promise<Blob> {
        return new Promise<Blob>(resolve => {
            this.mediaRecorder &&
            (this.mediaRecorder.onstop = async () => {
                const blob = await getWaveBlob(this.recordedBlobs!, false, {sampleRate: 48000});
                this.mediaStream?.getTracks().forEach(track => track.stop());
                this.mediaRecorder = undefined;
                this.mediaStream = undefined;
                this.recordedBlobs = undefined;
                resolve(blob);
            });
            this.mediaRecorder?.stop();
        });
    }
}
