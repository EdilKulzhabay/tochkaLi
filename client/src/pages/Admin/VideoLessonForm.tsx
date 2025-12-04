import { VideoContentForm } from '../../components/Admin/VideoContentForm';

export const VideoLessonForm = () => {
    return (
        <VideoContentForm 
            contentType="video-lesson"
            title="Видео урок"
            listRoute="/admin/video-lesson"
        />
    );
};
