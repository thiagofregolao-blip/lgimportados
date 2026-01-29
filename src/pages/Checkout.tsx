import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "../store/store";
import { TopBar } from "../components/TopBar";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Loader2, CreditCard, QrCode, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
    const [, setLocation] = useLocation();
    const { cart, cartTotal, clearCart } = useStore();
    const [step, setStep] = useState(1); // 1: Identificação, 2: Pagamento, 3: Sucesso
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("pix");

    // Dados do cliente
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: ""
    });

    // Cotação fixa para o exemplo (ideal seria vir do backend)
    const EXCHANGE_RATE = 6.15;

    // Redirecionar se carrinho vazio (apenas se não estiver no sucesso)
    useEffect(() => {
        if (cart.length === 0 && step !== 3) {
            setLocation("/");
        }
    }, [cart, step, setLocation]);

    const totalUSD = cart.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);
    const totalBRL = totalUSD * EXCHANGE_RATE;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.phone) {
                alert("Por favor, preencha pelo menos Nome e Celular.");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            handleFinishOrder();
        }
    };

    const handleFinishOrder = async () => {
        setLoading(true);

        // Simulação de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Aqui enviaria para o backend...

        setLoading(false);
        setStep(3);
        clearCart();
    };

    const handleWhatsAppRedirect = () => {
        // Mensagem formatada para o WhatsApp após "sucesso" (MVP)
        const itemsList = cart.map(i => `📦 ${i.quantity}x ${i.name}`).join('\n');
        const methodDict: { [key: string]: string } = { pix: 'Pix (Imediato)', card: 'Cartão de Crédito' };

        const message = encodeURIComponent(
            `*Olá, acabei de fazer um pedido no site!* 🎉\n\n` +
            `*Número do Pedido:* #${Math.floor(Math.random() * 9999)}\n` +
            `*Cliente:* ${formData.name}\n` +
            `*Pagamento:* ${methodDict[paymentMethod]}\n\n` +
            `*Resumo do Pedido:*\n${itemsList}\n\n` +
            `*Total:* US$ ${totalUSD.toLocaleString('en-US')} (R$ ${totalBRL.toLocaleString('pt-BR')})\n\n` +
            `_Aguardo confirmação para pagamento._`
        );

        window.open(`https://wa.me/5545999999999?text=${message}`, '_blank');
    };

    if (step === 3) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <TopBar />
                <Header />
                <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h1>
                        <p className="text-gray-600 mb-6">
                            Seu pedido foi registrado com sucesso. Para confirmar o pagamento e agilizar o envio, envie o comprovante no nosso WhatsApp.
                        </p>
                        <div className="space-y-4">
                            <Button onClick={handleWhatsAppRedirect} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg">
                                Enviar Comprovante no WhatsApp
                            </Button>
                            <Button variant="outline" onClick={() => setLocation("/")} className="w-full">
                                Voltar para a Loja
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <TopBar />
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <Lock className="w-6 h-6 text-green-600" />
                        Finalizar Compra
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Coluna Esquerda: Formulário */}
                        <div className="md:col-span-2 space-y-6">

                            {/* Passo 1: Identificação */}
                            <Card className={step !== 1 ? "opacity-60 pointer-events-none" : ""}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                        Identificação
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            <Input id="name" placeholder="Ex: João Silva" value={formData.name} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf">CPF (Opcional)</Label>
                                            <Input id="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="joao@email.com" value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Celular / WhatsApp *</Label>
                                            <Input id="phone" placeholder="(11) 99999-9999" value={formData.phone} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    {step === 1 && (
                                        <Button className="w-full mt-4" onClick={handleNextStep}>
                                            Continuar para Pagamento <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Passo 2: Pagamento */}
                            <Card className={step !== 2 ? "opacity-60 pointer-events-none" : ""}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                        Pagamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                                            <Label htmlFor="pix" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <QrCode className="mb-3 h-6 w-6" />
                                                <span className="font-semibold">Pix (Imediato)</span>
                                                <span className="text-xs text-green-600 mt-1">-5% de Desconto</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                            <Label htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <CreditCard className="mb-3 h-6 w-6" />
                                                <span className="font-semibold">Cartão de Crédito</span>
                                                <span className="text-xs text-gray-500 mt-1">Até 12x c/ juros</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {step === 2 && paymentMethod === 'card' && (
                                        <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                                            ⚠️ No momento, pagamentos via cartão são processados presencialmente ou via link seguro enviado no WhatsApp.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>

                        {/* Coluna Direita: Resumo */}
                        <div className="md:col-span-1">
                            <Card className="sticky top-24 shadow-lg border-2 border-primary/10">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <CardTitle>Resumo do Pedido</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 text-sm">
                                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium line-clamp-2">{item.name}</p>
                                                <p className="text-gray-500">{item.quantity}x US$ {item.priceUSD}</p>
                                            </div>
                                            <div className="font-semibold">
                                                US$ {item.priceUSD * item.quantity}
                                            </div>
                                        </div>
                                    ))}

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal (USD)</span>
                                            <span>US$ {totalUSD.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Cotação Hoje</span>
                                            <span>R$ {EXCHANGE_RATE.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold text-primary">
                                            <span>Total (BRL)</span>
                                            <span>R$ {totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <p className="text-xs text-center text-gray-500 mt-2">
                                            Pagamento em Reais via Pix ou Cartão Nacional.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {step === 2 && (
                                        <Button
                                            className="w-full h-12 text-lg font-bold shadow-md hover:shadow-xl transition-all"
                                            onClick={handleFinishOrder}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pagar R$ ${totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
