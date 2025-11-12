import { BackNav } from "../../components/User/BackNav";
import { UserLayout } from "../../components/User/UserLayout";

const ContactUsBlock = ({ title, content, isLink = false }: { title: string, content: string, isLink?: boolean }) => {
    return (
        <div className="bg-[#333333] rounded-lg p-4">
            <p className="text-sm text-white/40">{title}</p>
            <p className="mt-1 text-lg font-medium">{isLink ? <a href={content} className="text-white">{content}</a> : content}</p>
        </div>
    );
};

export const ClientContactUs = () => {
    return (
        <div>
            <UserLayout>
                <BackNav title="Связаться с нами" />
                <div className='px-4 mt-8 pb-5 flex flex-col justify-between'>
                    <div className="space-y-3">
                        <ContactUsBlock title="E-mail" content="support@tochka.li" isLink={true} />
                        <ContactUsBlock title="Telegram" content="https://t.me/tochkaliteam" isLink={true} />
                        <ContactUsBlock title="Website" content="www.tochka.li" isLink={true}/>
                        <ContactUsBlock title="YouTube" content="youtube.com/@tochkali" isLink={true} />
                        <ContactUsBlock title="Instagram" content="instagram.com/nurlan_muratkali" isLink={true} />
                        <ContactUsBlock title="Адрес" content="123104, г. Москва, ул. Малая Бронная, д.21/13, кв.3" />
                    </div>
                    <div className="text-center text-white/60 mt-3">Версия приложения 0.0.1</div>
                </div>
            </UserLayout>
        </div>
    );
};