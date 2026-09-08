import torch
import torch.nn as nn
import torch.nn.functional as F
import base64
from io import BytesIO
from PIL import Image
import torchvision.transforms as transforms

# -------------------------------------------------------------
# ARQUITETURA MOCK (Simulando MobileFaceNet / ArcFace)
# Substitua por sua classe oficial do MobileFaceNet/ResNet
# -------------------------------------------------------------
class MockMobileFaceNet(nn.Module):
    def __init__(self, embedding_size=128):
        super(MockMobileFaceNet, self).__init__()
        # Simulação de uma arquitetura CNN leve
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=2, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.prelu1 = nn.PReLU(64)
        
        # Como as imagens serão 112x112, após conv1 (stride 2) teremos 56x56
        self.fc = nn.Linear(64 * 56 * 56, embedding_size)
        
    def forward(self, x):
        x = self.prelu1(self.bn1(self.conv1(x)))
        x = x.view(x.size(0), -1) # Flatten
        x = self.fc(x)
        # Normalização L2 do embedding (Essencial para Cosine Similarity / ArcFace)
        return F.normalize(x, p=2, dim=1)


class FaceVerifier:
    def __init__(self, model_path=None, embedding_size=128):
        # Detectar CPU/GPU
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[*] FaceVerifier inicializado usando dispositivo: {self.device}")
        
        # Inicializa o modelo (Substitua por sua arquitetura real)
        self.model = MockMobileFaceNet(embedding_size=embedding_size).to(self.device)
        
        if model_path:
            try:
                # Tenta carregar pesos (.pth ou .pt)
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                print(f"[*] Pesos carregados com sucesso de {model_path}")
            except Exception as e:
                print(f"[!] Aviso: Não foi possível carregar os pesos ({e}). Usando pesos aleatórios.")
        else:
            print("[!] Aviso: Nenhum model_path fornecido. Usando pesos inicializados aleatoriamente.")
            
        # Coloca o modelo em modo de avaliação
        self.model.eval()
        
        # Pipeline de pré-processamento padrão para modelos de face (ex: InsightFace)
        self.transform = transforms.Compose([
            transforms.Resize((112, 112)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]) # Normaliza para [-1, 1]
        ])

    def preprocess_base64(self, base64_img: str) -> torch.Tensor:
        """Decodifica a string Base64 e converte em Tensor (1, C, H, W)."""
        if "," in base64_img:
            base64_img = base64_img.split(",")[1]
            
        img_data = base64.b64decode(base64_img)
        img = Image.open(BytesIO(img_data)).convert("RGB")
        
        tensor = self.transform(img).unsqueeze(0) # Adiciona dimensão do batch
        return tensor.to(self.device)

    def get_embedding(self, base64_img: str) -> list:
        """Passa a imagem pelo modelo em modo torch.no_grad e retorna lista de float."""
        tensor = self.preprocess_base64(base64_img)
        with torch.no_grad():
            embedding = self.model(tensor)
        return embedding.cpu().numpy()[0].tolist()

    @staticmethod
    def cosine_similarity(emb1: list, emb2: list) -> float:
        """Calcula similaridade de cosseno (de -1.0 a 1.0) entre dois vetores."""
        t1 = torch.tensor(emb1).unsqueeze(0)
        t2 = torch.tensor(emb2).unsqueeze(0)
        sim = F.cosine_similarity(t1, t2)
        return sim.item()

# Inicializa um Singleton global para o verificador de face
# Para usar seus pesos reais: FaceVerifier(model_path="./weights/mobilefacenet.pth")
face_verifier = FaceVerifier()
