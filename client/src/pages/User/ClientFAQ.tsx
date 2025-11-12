import { useEffect, useState } from "react";
import { UserLayout } from "../../components/User/UserLayout"
import api from "../../api";
import { BackNav } from "../../components/User/BackNav";
import { MobileAccordionList } from "../../components/User/MobileAccordionList";

export const ClientFAQ = () => {
    const [faqs, setFaqs] = useState<{ title: string, content: string }[]>([]);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        const response = await api.get('/api/faq');
        console.log(response.data.list);
        setFaqs(response.data.list);
    }
    return (
        <UserLayout>
            <BackNav title="Часто задаваемые вопросы" />
            {faqs && faqs.length > 0 && (
                <div className="px-4 mt-8">
                    <MobileAccordionList items={faqs.map((faq: any) => ({ title: faq.question, content: faq.answer }))} />
                </div>
            )}
        </UserLayout>
    )
}