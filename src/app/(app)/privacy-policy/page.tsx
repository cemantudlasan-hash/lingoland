import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Privacy Policy for LingoLandVerse.com</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
                
                <h2>1. Introduction</h2>
                <p>Welcome to LingoLandVerse.com ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>

                <h2>2. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul>
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register with the Site.</li>
                    <li><strong>Usage Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                    <li><strong>Data from AI Features:</strong> Content, text, and other information you provide when using our AI-powered features, such as the exercise generator or pronunciation pro.</li>
                </ul>

                <h2>3. Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Improve our website and services, including our AI models.</li>
                </ul>

                <h2>4. Disclosure of Your Information</h2>
                <p>We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes.</p>

                <h2>5. Security of Your Information</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
                
                <h2>6. Policy for Children</h2>
                <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.</p>

                <h2>7. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: cemantudlasan@gmail.com</p>
            </CardContent>
        </Card>
    );
}
