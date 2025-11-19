import { useEffect, useState } from "react";
import { UserLayout } from "../../components/User/UserLayout"
import api from "../../api";
import { BackNav } from "../../components/User/BackNav";
import { MobileAccordionList } from "../../components/User/MobileAccordionList";
import { MyLink } from "../../components/User/MyLink";

export const ClientFAQ = () => {
    const [faqs, setFaqs] = useState<{ title: string, content: string }[]>([]);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        const response = await api.get('/api/faq');
        setFaqs(response.data.list);
    }
    return (
        <UserLayout>
            <div className="flex flex-col min-h-screen">
                <BackNav title="Часто задаваемые вопросы" />
                <div className="flex flex-col justify-between pt-8 px-4 pb-10 flex-1">
                    <div className="">
                        {faqs && faqs.length > 0 && (
                            <div className="">
                                <MobileAccordionList items={faqs.map((faq: any) => ({ title: faq.question, content: faq.answer }))} />
                            </div>
                        )}
                    </div>
                    <MyLink to="/client/contactus" text="Связаться с нами" className='w-full mt-4' color='red'/>
                </div>
            </div> 
        </UserLayout>
    )
}