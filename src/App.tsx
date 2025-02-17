import {Record} from "./components/Record.tsx";
import useCreateAudio from "./hooks/useCreateAudio.ts";


function App() {
    const {
        status,
        setStatus,
        description,
        setDescription,
        recordDuration,
        startRecord,
        stopRecord,
        showCountdown,
        reset,
    } = useCreateAudio();
    return (
        <div>
            <Record
                recordStatus={status}
                guideText={description}
                showCountdown={showCountdown}
                recordDuration={recordDuration}
                onStartRecordClick={startRecord}
                onStopRecordClick={stopRecord}
            />
        </div>
    )
}

export default App