"use client";
import { useEffect, useMemo, useState } from "react";
import { 
  Card,
  Input,
  Button,
  Divider,
  Tooltip,
  CardHeader,
  CardBody,
  CardFooter,
  Spinner,
  DateInput,
  Link
} from "@nextui-org/react";
import { IoEye, IoKey, IoPencil } from "react-icons/io5";
import Cookies from "js-cookie";
import { CalendarDate } from "@internationalized/date";

interface UserInfo {
  id: number;
  nome: string;
  email: string;
  numero_contato: string;
  tipo_usuario: string;
  data_criacao: string;
  senha_hash: string;
}

interface FormData {
  id: number;
  nome: string;
  email: string;
  numero_contato: string;
  tipo_usuario: string;
  data_criacao: string;
  senha_hash: string;
}

export default function Account() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const usuarioId = Cookies.get("internal_user_id");
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/dashboard/user/account/?userId=${usuarioId}`);
      if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
      const data = await response.json();
      setUserInfo(data);
      setFormData(data); // Set initial form data
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/user/account/?userId=${usuarioId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: usuarioId,
          nome: formData.nome,
          email: formData.email,
          numeroContato: formData.numero_contato,
          // Include current password hash if not changing
          senhaHash: formData.senha_hash
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar dados.");
      }
      
      const updatedData = await response.json();
      setUserInfo(updatedData);
      setIsEditMode(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao salvar informações.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleEdit = () => {
    setIsEditMode(!isEditMode);
  };

  const convertToCalendarDate = (dateString: string) => {
    const date = new Date(dateString);
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  };

  const formatPhoneNumber = (value: string) => {
    return value
      .replace(/\D/g, "") // Remove todos os caracteres não-numéricos
      .replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3") // Aplica a máscara progressivamente
      .slice(0, 15); // Limita a 15 caracteres
  };
  const handlePhoneChange = (e: { target: { value: any; }; }) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormData({ ...formData!, numero_contato: formattedNumber });
  };

  const isInvalidPhoneNumber = useMemo(() => {
    const invalidNumbers = [
      "(00) 00000-0000",
      "(11) 11111-1111",
      "(22) 22222-2222",
    ];
    return (
      formData?.numero_contato.length !== 15 || invalidNumbers.includes(formData?.numero_contato)
    );
  }, [formData?.numero_contato]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <Card className="w-full max-w-3xl p-10">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Account</h2>
          <Tooltip content={isEditMode ? "View" : "Edit"} placement="left">
            <Button isIconOnly onPress={handleToggleEdit}>
              {isEditMode ? <IoEye /> : <IoPencil />}
            </Button>
          </Tooltip>
        </CardHeader>

        <CardBody>
          <div className="space-y-4">
            <div className="">
              <h5 className="mb-2">inscrição</h5>
              <div className="space-y-2">
                <Input
                  fullWidth
                  label="Status"
                  value={userInfo?.tipo_usuario}
                  readOnly
                />

                <DateInput
                  fullWidth
                  label="Data de Inscrição"
                  value={userInfo?.data_criacao ? convertToCalendarDate(userInfo.data_criacao) : null}
                  isReadOnly
                />
              </div>
            </div>

            <Divider className="my-4" />

            <div className="">
              <h5 className="mb-2">Informações pessoais</h5>
              <div className="space-y-2">
                <Input
                  fullWidth
                  label="Nome"
                  value={formData?.nome || ""}
                  readOnly={!isEditMode}
                  onChange={(e) => setFormData({ ...formData!, nome: e.target.value })}
                />
                <Input
                  fullWidth
                  label="Contato"
                  value={formData?.numero_contato || ""}
                  readOnly={!isEditMode}
                  onChange={handlePhoneChange}
                  isInvalid={hasTriedSubmit && isInvalidPhoneNumber}
                  errorMessage={
                    hasTriedSubmit && isInvalidPhoneNumber
                      ? "Número de contato inválido"
                      : ""
                  }
                />
                <Input
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData?.email || ""}
                  readOnly={!isEditMode}
                  onChange={(e) => setFormData({ ...formData!, email: e.target.value })}
                />
                <Link isDisabled={!isEditMode} className="w-full" href="/signin/recovery">
                  <Button
                    isDisabled={!isEditMode}
                    color={ isEditMode ? "primary" : "default" }
                    className="w-full"
                  >
                    <IoKey /> Redefinir senha
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </CardBody>
        <CardFooter>
          {isEditMode && (
            <Button isDisabled={!isEditMode} color={ isEditMode ? "primary" : "default" } onPress={handleSave}>
              Salvar
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
