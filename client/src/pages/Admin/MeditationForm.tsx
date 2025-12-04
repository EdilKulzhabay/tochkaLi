import { VideoContentForm } from '../../components/Admin/VideoContentForm';

export const MeditationForm = () => {
    return (
        <VideoContentForm 
            contentType="meditation"
            title="Медитация"
            listRoute="/admin/meditation"
        />
    );
};
