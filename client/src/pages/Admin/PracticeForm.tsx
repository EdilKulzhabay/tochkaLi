import { VideoContentForm } from '../../components/Admin/VideoContentForm';

export const PracticeForm = () => {
    return (
        <VideoContentForm 
            contentType="practice"
            title="Практика"
            listRoute="/admin/practice"
        />
    );
};
